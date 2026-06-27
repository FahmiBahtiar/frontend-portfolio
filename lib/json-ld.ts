/**
 * Serialize an object for safe injection into a <script type="application/ld+json">
 * via dangerouslySetInnerHTML. Escapes '<' '>' '&' and the line/paragraph
 * separators so attacker-controlled backend strings (e.g. hero.description) can
 * never break out of the script tag. Prevents stored XSS.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/[\u2028\u2029]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}
