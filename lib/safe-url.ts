/**
 * Returns the URL only if it is a safe absolute http(s) link, otherwise
 * undefined. Blocks javascript:, data:, vbscript: and other dangerous schemes
 * on backend-controlled links (project demo/github URLs, contact links).
 */
export function safeExternalUrl(url: unknown): string | undefined {
  if (typeof url !== 'string' || url.trim() === '') return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // not a valid absolute URL
  }
  return undefined;
}
