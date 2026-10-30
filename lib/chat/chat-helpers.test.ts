import { describe, it, expect } from 'vitest';
import {
  sanitizeChatInput,
  parseSseStreamChunk,
  formatSafeLinkHref,
  extractLinkTokens,
} from './chat-helpers';

describe('chat-helpers', () => {
  describe('sanitizeChatInput', () => {
    it('rejects empty or whitespace-only inputs', () => {
      expect(sanitizeChatInput('')).toEqual({
        isValid: false,
        error: 'Pesan tidak boleh kosong',
        cleaned: '',
      });
      expect(sanitizeChatInput('   ')).toEqual({
        isValid: false,
        error: 'Pesan tidak boleh kosong',
        cleaned: '',
      });
    });

    it('rejects inputs exceeding 500 characters', () => {
      const longInput = 'x'.repeat(501);
      const res = sanitizeChatInput(longInput);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('500');
    });

    it('accepts and trims valid inputs', () => {
      const res = sanitizeChatInput('  Ceritakan tentang skill Fahmi  ');
      expect(res.isValid).toBe(true);
      expect(res.cleaned).toBe('Ceritakan tentang skill Fahmi');
      expect(res.error).toBeUndefined();
    });
  });

  describe('parseSseStreamChunk', () => {
    it('parses valid SSE data chunks correctly', () => {
      const rawChunk = 'data: {"type":"chunk","text":"Halo"}\n\ndata: {"type":"chunk","text":" dari AI"}\n\n';
      const parsed = parseSseStreamChunk(rawChunk);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual({ type: 'chunk', text: 'Halo' });
      expect(parsed[1]).toEqual({ type: 'chunk', text: ' dari AI' });
    });

    it('ignores invalid or heartbeat lines', () => {
      const rawChunk = ': ping\n\ndata: {"type":"done"}\n\n';
      const parsed = parseSseStreamChunk(rawChunk);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toEqual({ type: 'done' });
    });
  });

  describe('formatSafeLinkHref', () => {
    it('handles email addresses with mailto:', () => {
      expect(formatSafeLinkHref('fahmibahtiar76@gmail.com')).toEqual({
        href: 'mailto:fahmibahtiar76@gmail.com',
        isExternal: false,
      });
      expect(formatSafeLinkHref('mailto:test@example.com')).toEqual({
        href: 'mailto:test@example.com',
        isExternal: false,
      });
    });

    it('handles absolute http and https URLs', () => {
      expect(formatSafeLinkHref('https://blimbing.me')).toEqual({
        href: 'https://blimbing.me',
        isExternal: true,
      });
      expect(formatSafeLinkHref('http://github.com/FahmiBahtiar')).toEqual({
        href: 'http://github.com/FahmiBahtiar',
        isExternal: true,
      });
    });

    it('handles domain-style URLs without protocol', () => {
      expect(formatSafeLinkHref('linkedin.com/in/fahmi-bahtiar-an')).toEqual({
        href: 'https://linkedin.com/in/fahmi-bahtiar-an',
        isExternal: true,
      });
      expect(formatSafeLinkHref('github.com/FahmiBahtiar')).toEqual({
        href: 'https://github.com/FahmiBahtiar',
        isExternal: true,
      });
      expect(formatSafeLinkHref('www.google.com')).toEqual({
        href: 'https://www.google.com',
        isExternal: true,
      });
    });

    it('handles in-page anchors like #contact', () => {
      expect(formatSafeLinkHref('#contact')).toEqual({
        href: '#contact',
        isExternal: false,
      });
    });

    it('blocks dangerous schemes like javascript: or data:', () => {
      expect(formatSafeLinkHref('javascript:alert(1)')).toBeNull();
      expect(formatSafeLinkHref('data:text/html,<script></script>')).toBeNull();
      expect(formatSafeLinkHref('vbscript:msgbox()')).toBeNull();
    });
  });

  describe('extractLinkTokens', () => {
    it('extracts markdown links correctly', () => {
      const tokens = extractLinkTokens('Lihat [LinkedIn](https://linkedin.com/in/fahmi) ya');
      expect(tokens).toEqual([
        { type: 'text', content: 'Lihat ' },
        {
          type: 'link',
          content: 'LinkedIn',
          href: 'https://linkedin.com/in/fahmi',
          isExternal: true,
        },
        { type: 'text', content: ' ya' },
      ]);
    });

    it('extracts bare email addresses and attaches mailto:', () => {
      const tokens = extractLinkTokens('Hubungi fahmibahtiar76@gmail.com.');
      expect(tokens).toEqual([
        { type: 'text', content: 'Hubungi ' },
        {
          type: 'link',
          content: 'fahmibahtiar76@gmail.com',
          href: 'mailto:fahmibahtiar76@gmail.com',
          isExternal: false,
        },
        { type: 'text', content: '.' },
      ]);
    });

    it('extracts bare domains without protocol', () => {
      const tokens = extractLinkTokens('Kunjungi linkedin.com/in/fahmi-bahtiar-an!');
      expect(tokens).toEqual([
        { type: 'text', content: 'Kunjungi ' },
        {
          type: 'link',
          content: 'linkedin.com/in/fahmi-bahtiar-an',
          href: 'https://linkedin.com/in/fahmi-bahtiar-an',
          isExternal: true,
        },
        { type: 'text', content: '!' },
      ]);
    });

    it('neutralizes dangerous javascript: links in markdown', () => {
      const tokens = extractLinkTokens('Klik [Disini](javascript:alert(1))');
      expect(tokens).toEqual([
        { type: 'text', content: 'Klik ' },
        { type: 'text', content: 'Disini' },
      ]);
    });
  });
});
