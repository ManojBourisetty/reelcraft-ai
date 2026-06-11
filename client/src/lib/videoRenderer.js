/**
 * Client-side reel renderer using FFmpeg.wasm.
 *
 * Stitches the user's uploaded clips (videos trimmed per the AI's clip order,
 * photos as short still segments) into a single 9:16 vertical MP4 — entirely
 * in the browser. No upload, no server, no watermark.
 *
 * The WASM core (~25MB) is loaded on demand from a CDN the first time a reel
 * is rendered, then cached for the session.
 */

const CORE_VERSION = '0.12.10';
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

// Instagram Reels canvas
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DEFAULT_PHOTO_SEC = 3;
const MIN_CLIP_SEC = 0.5;
const MAX_CLIP_SEC = 15;

// Scale to cover the 1080x1920 frame, then center-crop the overflow.
const COVER_FILTER =
  `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,` +
  `crop=${WIDTH}:${HEIGHT},setsar=1,fps=${FPS},format=yuv420p`;

// Photos straight off a phone (12MP+, often HEIC) make the WASM scale/encode
// step extremely slow — each second of a looped photo re-decodes and rescales
// the full-resolution source 30 times. Downscaling to a longer-edge cap before
// handing the file to FFmpeg cuts that work down without affecting the final
// 1080x1920 output (anything beyond this is cropped away anyway).
const MAX_PHOTO_DIM = 2160;
const PHOTO_JPEG_QUALITY = 0.92;

let ffmpeg = null;
let loadPromise = null;

async function getFFmpeg(onStatus) {
  if (ffmpeg) return ffmpeg;
  if (!loadPromise) {
    loadPromise = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
      ]);
      const instance = new FFmpeg();
      onStatus?.('Loading video engine (first run downloads ~25MB)…');
      await instance.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      ffmpeg = instance;
      return instance;
    })();
  }
  return loadPromise;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clipDuration(clip) {
  const raw = (clip.endSec ?? 0) - (clip.startSec ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_PHOTO_SEC;
  return clamp(raw, MIN_CLIP_SEC, MAX_CLIP_SEC);
}

const extFor = (asset) => (asset.isVideo ? 'mp4' : 'jpg');

const isHeic = (file) => /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name || '');

/**
 * Downscale a photo to a manageable resolution (and convert HEIC -> JPEG) before
 * handing it to FFmpeg.wasm. Source photos straight off a phone camera are often
 * 12MP+; looping and scaling that for every frame of a clip is the dominant cost
 * of rendering on Safari. Capping the longer edge at MAX_PHOTO_DIM keeps full
 * quality for the final 1080x1920 output while drastically cutting decode/scale work.
 *
 * @param {File|Blob} file
 * @returns {Promise<Blob>} a JPEG blob, resized if it exceeded MAX_PHOTO_DIM
 */
async function preparePhotoInput(file) {
  let source = file;
  if (isHeic(file)) {
    const { default: heic2any } = await import('heic2any');
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: PHOTO_JPEG_QUALITY });
    source = Array.isArray(out) ? out[0] : out;
  }

  const url = URL.createObjectURL(source);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image load failed'));
      el.src = url;
    });

    const { naturalWidth: w, naturalHeight: h } = img;
    const longEdge = Math.max(w, h);
    if (longEdge <= MAX_PHOTO_DIM && source.type === 'image/jpeg') {
      return source;
    }

    const scale = Math.min(1, MAX_PHOTO_DIM / longEdge);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
        'image/jpeg',
        PHOTO_JPEG_QUALITY
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * @param {Array<{ asset: { isVideo: boolean }, file: Blob, startSec: number, endSec: number }>} clips
 * @param {(text: string, ratio: number|null) => void} [onProgress]
 * @returns {Promise<Blob>} rendered MP4
 */
export async function renderReel(clips, onProgress) {
  if (!clips || clips.length === 0) {
    throw new Error('No clips available to render. Try analyzing your media first.');
  }

  const ff = await getFFmpeg((text) => onProgress?.(text, null));
  const { fetchFile } = await import('@ffmpeg/util');

  // Normalize each clip into a uniform 1080x1920 / 30fps / H.264 video-only segment.
  // Reserve the final step (concat) as its own slice of the progress bar so it
  // doesn't sit at 100% while the (usually fast) concat is still running.
  const totalSteps = clips.length + 1;
  const segmentNames = [];
  for (let i = 0; i < clips.length; i++) {
    const { asset, file, startSec } = clips[i];
    const duration = clipDuration(clips[i]);
    const inName = `in${i}.${extFor(asset)}`;
    const segName = `seg${i}.mp4`;

    onProgress?.(`Processing clip ${i + 1} of ${clips.length}…`, i / totalSteps);
    const inputFile = asset.isVideo ? file : await preparePhotoInput(file);
    await ff.writeFile(inName, await fetchFile(inputFile));

    const args = asset.isVideo
      ? [
          '-ss', String(Math.max(0, startSec || 0)),
          '-t', String(duration),
          '-i', inName,
          '-vf', COVER_FILTER,
          '-an',
          '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
          segName,
        ]
      : [
          '-loop', '1',
          '-t', String(duration),
          '-i', inName,
          '-vf', COVER_FILTER,
          '-an',
          '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
          segName,
        ];

    await ff.exec(args);
    await ff.deleteFile(inName);
    segmentNames.push(segName);
  }

  // Concatenate the normalized segments (same codec/params → stream copy).
  const listFile = segmentNames.map((n) => `file '${n}'`).join('\n');
  await ff.writeFile('concat.txt', new TextEncoder().encode(listFile));

  onProgress?.('Stitching final reel…', clips.length / totalSteps);
  await ff.exec([
    '-f', 'concat', '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    'reel.mp4',
  ]);

  const data = await ff.readFile('reel.mp4');

  // Cleanup MEMFS so repeat renders don't accumulate memory.
  await ff.deleteFile('reel.mp4').catch(() => {});
  await ff.deleteFile('concat.txt').catch(() => {});
  await Promise.all(segmentNames.map((n) => ff.deleteFile(n).catch(() => {})));

  onProgress?.('Done!', 1);
  return new Blob([data.buffer], { type: 'video/mp4' });
}

/**
 * Map an AI reel concept's clipOrder onto the analyzed assets + their original files.
 * Falls back to using every usable asset in order when no clip order is present.
 *
 * @param {object} concept - reel concept with optional clipOrder
 * @param {Array<{ id: string, isVideo: boolean }>} usableAssets - analyzed assets in prompt order
 * @param {Record<string, Blob>} originalFiles - id → original File/Blob
 */
export function buildClips(concept, usableAssets, originalFiles) {
  const order =
    Array.isArray(concept?.clipOrder) && concept.clipOrder.length > 0
      ? concept.clipOrder
      : usableAssets.map((_, i) => ({ clip: i + 1, startSec: 0, endSec: DEFAULT_PHOTO_SEC }));

  const clips = [];
  for (const entry of order) {
    const idx = (Number(entry.clip) || 1) - 1;
    const asset = usableAssets[idx];
    if (!asset) continue;
    const file = originalFiles[asset.id];
    if (!file) continue; // original no longer available
    clips.push({ asset, file, startSec: entry.startSec ?? 0, endSec: entry.endSec ?? 0 });
  }
  return clips;
}
