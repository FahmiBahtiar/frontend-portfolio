import { describe, it, expect } from 'vitest';
import { sanitizeChatInput, parseSseStreamChunk } from './chat-helpers';

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
});
