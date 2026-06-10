/**
 * Client-side media processing.
 * Compresses images/video-frames to JPEG base64 via Canvas API.
 * Max dimension: 800px. Quality: 0.80. Keeps payloads well under Vercel's 4.5MB limit.
 */

const MAX_DIM = 800;
const JPEG_QUALITY = 0.80;

function drawToCanvas(source, naturalWidth, naturalHeight) {
  const scale = Math.min(1, MAX_DIM / Math.max(naturalWidth, naturalHeight));
  const w = Math.round(naturalWidth * scale);
  const h = Math.round(naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
      const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];
      URL.revokeObjectURL(url);
      resolve(base64);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

const VIDEO_FRAME_TIMEOUT_MS = 8000;

export function extractVideoFrame(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(result);
    };

    video.onloadeddata = () => {
      // duration may be Infinity/NaN for some streamed/odd-encoded files
      const seekTo = Number.isFinite(video.duration) ? Math.min(1, video.duration * 0.1) : 0;
      video.currentTime = seekTo;
    };

    video.onseeked = () => {
      try {
        const canvas = drawToCanvas(video, video.videoWidth || 640, video.videoHeight || 480);
        const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];
        finish(base64);
      } catch {
        finish(null);
      }
    };

    // Fallback — some browsers don't fire onseeked/onloadeddata reliably
    video.onerror = () => finish(null);
    const timer = setTimeout(() => finish(null), VIDEO_FRAME_TIMEOUT_MS);

    video.src = url;
    video.load();
  });
}

/**
 * Process a raw File into the shape the backend expects:
 * { id, originalName, mimeType, isVideo, base64, thumbnailUrl }
 */
export async function processFile(file, id) {
  const isVideo = file.type.startsWith('video/');
  let base64 = null;
  let thumbnailUrl = null;

  if (isVideo) {
    base64 = await extractVideoFrame(file);
    if (base64) {
      thumbnailUrl = `data:image/jpeg;base64,${base64}`;
    }
  } else {
    base64 = await compressImage(file);
    // Use the canvas-converted JPEG for the thumbnail so HEIC/HEIF photos
    // (iPhone default) render reliably in <img> across browsers.
    thumbnailUrl = `data:image/jpeg;base64,${base64}`;
  }

  return {
    id,
    originalName: file.name,
    mimeType: file.type,
    isVideo,
    base64,
    thumbnailUrl,
    // Original File kept in-browser only (for client-side reel rendering).
    // Stripped out before anything is sent to the backend.
    file,
  };
}
