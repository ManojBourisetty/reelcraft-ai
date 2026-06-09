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

export function extractVideoFrame(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.muted = true;
    video.preload = 'metadata';

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = drawToCanvas(video, video.videoWidth || 640, video.videoHeight || 480);
      const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];
      URL.revokeObjectURL(url);
      resolve(base64);
    };

    // Fallback — some browsers don't fire onseeked reliably
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    setTimeout(() => {
      if (!video.src) return;
      URL.revokeObjectURL(url);
      resolve(null);
    }, 8000);

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
    thumbnailUrl = URL.createObjectURL(file); // original for crisp thumbnail display
  }

  return {
    id,
    originalName: file.name,
    mimeType: file.type,
    isVideo,
    base64,
    thumbnailUrl,
  };
}
