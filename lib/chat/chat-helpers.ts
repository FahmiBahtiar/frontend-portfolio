export interface SanitizeResult {
  isValid: boolean;
  error?: string;
  cleaned: string;
}

export const MAX_MESSAGE_CHARS = 500;

export function sanitizeChatInput(raw: string): SanitizeResult {
  if (!raw || typeof raw !== 'string') {
    return {
      isValid: false,
      error: 'Pesan tidak boleh kosong',
      cleaned: '',
    };
  }

  const cleaned = raw.trim();

  if (cleaned.length === 0) {
    return {
      isValid: false,
      error: 'Pesan tidak boleh kosong',
      cleaned: '',
    };
  }

  if (cleaned.length > MAX_MESSAGE_CHARS) {
    return {
      isValid: false,
      error: `Pesan tidak boleh melebihi ${MAX_MESSAGE_CHARS} karakter`,
      cleaned,
    };
  }

  return {
    isValid: true,
    cleaned,
  };
}

export function parseSseStreamChunk(rawChunk: string): Array<Record<string, any>> {
  const events: Array<Record<string, any>> = [];
  const lines = rawChunk.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) {
      continue;
    }

    const payload = trimmed.replace(/^data:\s*/, '').trim();
    if (!payload) continue;

    try {
      const parsed = JSON.parse(payload);
      events.push(parsed);
    } catch {
      // Ignore invalid JSON lines or heartbeats
    }
  }

  return events;
}

export interface FormattedLink {
  href: string;
  isExternal: boolean;
}

export function formatSafeLinkHref(rawUrl: string): FormattedLink | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return null;
  }

  // Anchor links
  if (trimmed.startsWith('#')) {
    return { href: trimmed, isExternal: false };
  }

  // Email / mailto:
  if (lower.startsWith('mailto:')) {
    return { href: trimmed, isExternal: false };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(trimmed)) {
    return { href: `mailto:${trimmed}`, isExternal: false };
  }

  // Standard absolute URL
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        const href =
          !trimmed.endsWith('/') && parsed.pathname === '/'
            ? parsed.href.replace(/\/$/, '')
            : parsed.href;
        return { href, isExternal: true };
      }
    } catch {
      return null;
    }
  }

  // Domain-like URLs without protocol (e.g. linkedin.com/..., github.com/..., www....)
  if (
    lower.startsWith('www.') ||
    lower.startsWith('linkedin.com') ||
    lower.startsWith('github.com') ||
    lower.startsWith('blimbing.me') ||
    /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)
  ) {
    try {
      const parsed = new URL(`https://${trimmed}`);
      const href =
        !trimmed.endsWith('/') && parsed.pathname === '/'
          ? parsed.href.replace(/\/$/, '')
          : parsed.href;
      return { href, isExternal: true };
    } catch {
      return null;
    }
  }

  return null;
}

export type InlineTokenType = 'text' | 'bold' | 'italic' | 'code' | 'link';

export interface InlineToken {
  type: InlineTokenType;
  content: string;
  href?: string;
  isExternal?: boolean;
}

/**
 * Splits plain text to detect links: Markdown [text](url), bare URLs, emails, or domain links.
 */
export function extractLinkTokens(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const linkRegex =
    /(\[[^\]]+\]\((?:[^()]+|\([^()]*\))*\)|https?:\/\/[^\s<>"')]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:linkedin\.com\/in\/[^\s<>"')]+|github\.com\/[^\s<>"')]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s<>"')]*))/g;

  const parts = text.split(linkRegex);

  for (const part of parts) {
    if (!part) continue;

    // 1. Markdown link: [Label](url)
    const mdMatch = part.match(/^\[(.*?)\]\(((?:[^()]+|\([^()]*\))*)\)$/);
    if (mdMatch) {
      const label = mdMatch[1];
      const rawHref = mdMatch[2];
      const formatted = formatSafeLinkHref(rawHref);
      if (formatted) {
        tokens.push({
          type: 'link',
          content: label,
          href: formatted.href,
          isExternal: formatted.isExternal,
        });
      } else {
        tokens.push({ type: 'text', content: label });
      }
      continue;
    }

    // 2. Auto link (Email, URL, or domain)
    // Separate trailing punctuation if any (e.g. "github.com/abc.")
    const punctMatch = part.match(/^(.*?)([.,;:!?)]*)$/);
    const candidate = punctMatch ? punctMatch[1] : part;
    const trailingPunct = punctMatch ? punctMatch[2] : '';

    const formatted = formatSafeLinkHref(candidate);
    if (formatted) {
      tokens.push({
        type: 'link',
        content: candidate,
        href: formatted.href,
        isExternal: formatted.isExternal,
      });
      if (trailingPunct) {
        tokens.push({ type: 'text', content: trailingPunct });
      }
    } else {
      tokens.push({ type: 'text', content: part });
    }
  }

  return tokens;
}
