import { describe, it, expect } from 'vitest';
import { serializeJsonLd } from './json-ld';

describe('serializeJsonLd', () => {
  it('escapes <, > and & so a </script> payload cannot break out', () => {
    const out = serializeJsonLd({ x: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('\\u003c');
    expect(out).toContain('\\u003e');
  });

  it('escapes ampersands', () => {
    expect(serializeJsonLd({ x: 'a&b' })).toContain('\\u0026');
  });

  it('escapes the U+2028 / U+2029 line separators', () => {
    const sep = 'a' + String.fromCharCode(0x2028) + 'b' + String.fromCharCode(0x2029) + 'c';
    const out = serializeJsonLd({ x: sep });
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
    expect(out).not.toContain(String.fromCharCode(0x2028));
    expect(out).not.toContain(String.fromCharCode(0x2029));
  });

  it('still produces valid JSON (escapes are valid JSON unicode escapes)', () => {
    const original = { name: 'A<b>&c', nested: { v: '</script>' } };
    const parsed = JSON.parse(serializeJsonLd(original));
    expect(parsed).toEqual(original);
  });
});
