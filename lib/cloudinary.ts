// Cloudinary delivery-URL transformer.
//
// Images on this site are uploaded to Cloudinary at full size and stored as raw
// delivery URLs in the DB. Cloudinary can derive an optimized version on the fly
// when transformation params are inserted into the delivery URL — no re-upload
// needed. We inject `f_auto` (WebP/AVIF when the browser supports it), `q_auto`
// (smart compression), `c_limit` + `w_<n>` (never upscale, cap the width) and
// `dpr_auto` (retina awareness).
//
// Non-Cloudinary URLs (local assets, other hosts, data URIs) are returned
// unchanged.

export interface CldOptions {
  /** Target width in px. Defaults to a sensible cap when omitted. */
  width?: number;
  /** Cloudinary quality. Defaults to 'auto'. */
  quality?: number | 'auto';
}

const UPLOAD_MARKER = '/upload/';
const DEFAULT_WIDTH = 1600;

/** True when `url` is a Cloudinary image delivery URL we can transform. */
function isCloudinaryDeliveryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') && url.includes(UPLOAD_MARKER);
}

export function cld(url: string, { width, quality = 'auto' }: CldOptions = {}): string {
  if (!url || typeof url !== 'string' || !isCloudinaryDeliveryUrl(url)) {
    return url;
  }

  const uploadAt = url.indexOf(UPLOAD_MARKER);
  const before = url.slice(0, uploadAt + UPLOAD_MARKER.length);
  const after = url.slice(uploadAt + UPLOAD_MARKER.length);

  // Already transformed by us (idempotent for repeated calls / pre-baked URLs).
  if (after.startsWith('f_auto') || after.includes('/f_auto')) {
    return url;
  }

  const transforms = [
    'f_auto',
    `q_${quality}`,
    'c_limit',
    `w_${Math.round(width ?? DEFAULT_WIDTH)}`,
    'dpr_auto',
  ].join(',');

  return `${before}${transforms}/${after}`;
}
