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

  // Domain-like URLs without protocol (e.g. linkedin.com/..., github.com/..., instagram.com/..., www....)
  if (
    lower.startsWith('www.') ||
    lower.startsWith('linkedin.com') ||
    lower.startsWith('github.com') ||
    lower.startsWith('instagram.com') ||
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
    /(\[[^\]]+\]\((?:[^()]+|\([^()]*\))*\)|https?:\/\/[^\s<>"')]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:linkedin\.com\/in\/[^\s<>"')]+|github\.com\/[^\s<>"')]+|instagram\.com\/[^\s<>"')]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s<>"')]*))/g;

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

export interface ParsedInlineNode {
  type: InlineTokenType;
  content: string;
  href?: string;
  isExternal?: boolean;
  children?: ParsedInlineNode[];
}

/**
 * Parses inline markdown content with strict protection for handles with underscores,
 * snake_case identifiers, and links, preventing accidental italicization.
 */
export function parseInlineContent(text: string): ParsedInlineNode[] {
  if (!text) return [];

  // Match priority:
  // 1. Code span: `...`
  // 2. Markdown link: [Label](url)
  // 3. Full URL: https?://...
  // 4. Bare Email: ...@...
  // 5. Bare Domain link: linkedin.com/... | github.com/... | instagram.com/... | www....
  // 6. Bold: **...**
  // 7. Italic asterisk: *(?!\s)...(?<!\s)*
  // 8. Italic underscore: must have word/space boundaries to avoid breaking handles like @fhm_bhtr.an
  const inlineRegex =
    /(`[^`]+`|\[[^\]]+\]\((?:[^()]+|\([^()]*\))*\)|https?:\/\/[^\s<>"')]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:linkedin\.com\/in\/|github\.com\/|instagram\.com\/|www\.)[^\s<>"')]+|\*\*[^*]+\*\*|\*(?!\s)[^*]+(?<!\s)\*|(?:^|(?<=\s))_(?:[a-zA-Z0-9][^_]*[a-zA-Z0-9])_(?=\s|[.,;:!?)]|$))/g;

  const rawParts = text.split(inlineRegex);
  const nodes: ParsedInlineNode[] = [];

  const pushText = (str: string) => {
    if (!str) return;
    const last = nodes[nodes.length - 1];
    if (last && last.type === 'text') {
      last.content += str;
    } else {
      nodes.push({ type: 'text', content: str });
    }
  };

  for (const part of rawParts) {
    if (!part) continue;

    // 1. Code span
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      nodes.push({
        type: 'code',
        content: part.slice(1, -1),
      });
      continue;
    }

    // 2. Markdown link: [Label](url)
    const mdLinkMatch = part.match(/^\[(.*?)\]\(((?:[^()]+|\([^()]*\))*)\)$/);
    if (mdLinkMatch) {
      const label = mdLinkMatch[1];
      const rawHref = mdLinkMatch[2];
      const formatted = formatSafeLinkHref(rawHref);
      if (formatted) {
        nodes.push({
          type: 'link',
          content: label,
          href: formatted.href,
          isExternal: formatted.isExternal,
        });
      } else {
        pushText(label);
      }
      continue;
    }

    // 3. Bold: **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      nodes.push({
        type: 'bold',
        content: inner,
        children: parseInlineContent(inner),
      });
      continue;
    }

    // 4. Asterisk Italic: *...*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      nodes.push({
        type: 'italic',
        content: inner,
      });
      continue;
    }

    // 5. Underscore Italic: _..._ (only bounded matches)
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
      const inner = part.slice(1, -1);
      nodes.push({
        type: 'italic',
        content: inner,
      });
      continue;
    }

    // 6. Bare URLs / Emails / Domains
    const punctMatch = part.match(/^(.*?)([.,;:!?)]*)$/);
    const candidate = punctMatch ? punctMatch[1] : part;
    const trailingPunct = punctMatch ? punctMatch[2] : '';

    const formatted = formatSafeLinkHref(candidate);
    if (formatted) {
      nodes.push({
        type: 'link',
        content: candidate,
        href: formatted.href,
        isExternal: formatted.isExternal,
      });
      if (trailingPunct) {
        pushText(trailingPunct);
      }
    } else {
      pushText(part);
    }
  }

  return nodes;
}
