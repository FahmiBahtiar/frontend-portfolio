import { describe, it, expect } from 'vitest';
import { safeExternalUrl } from './safe-url';

describe('safeExternalUrl', () => {
  it('allows https URLs', () => {
    expect(safeExternalUrl('https://example.com/x')).toBe('https://example.com/x');
  });

  it('allows http URLs', () => {
    expect(safeExternalUrl('http://example.com')).toBe('http://example.com/');
  });

  it('blocks javascript: scheme', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeExternalUrl('JavaScript:alert(1)')).toBeUndefined();
  });

  it('blocks data: and vbscript: schemes', () => {
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(safeExternalUrl('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('rejects relative or non-absolute strings', () => {
    expect(safeExternalUrl('/foo')).toBeUndefined();
    expect(safeExternalUrl('example.com')).toBeUndefined();
  });

  it('rejects empty / non-string input', () => {
    expect(safeExternalUrl('')).toBeUndefined();
    expect(safeExternalUrl('   ')).toBeUndefined();
    expect(safeExternalUrl(null)).toBeUndefined();
    expect(safeExternalUrl(undefined)).toBeUndefined();
    expect(safeExternalUrl(123 as unknown)).toBeUndefined();
  });
});
