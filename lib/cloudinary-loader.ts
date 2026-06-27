// Custom next/image loader. Next calls this once per srcset candidate width, so
// Cloudinary itself does the resize + format negotiation (offloaded from the
// Next optimizer). Non-Cloudinary URLs pass through unchanged — see lib/cloudinary.
import { cld } from './cloudinary';

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  return cld(src, { width, quality });
}
