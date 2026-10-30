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
