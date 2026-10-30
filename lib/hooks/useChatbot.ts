'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { sanitizeChatInput, parseSseStreamChunk } from '@/lib/chat/chat-helpers';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const STORAGE_SESSION_KEY = 'blimbing_chat_session_id';
const MAX_SESSION_MESSAGES = 20;

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load session ID from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = sessionStorage.getItem(STORAGE_SESSION_KEY);
      if (savedSession) {
        setSessionId(savedSession);
        // Optionally fetch history
        fetch(`${API_BASE_URL}/chat/session/${savedSession}`)
          .then((res) => res.json())
          .then((res) => {
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
              setMessages(res.data);
            }
          })
          .catch(() => {
            // Silently ignore history fetch errors
          });
      }
    }
  }, []);

  const isLimitReached = messages.filter((m) => m.role === 'user').length >= MAX_SESSION_MESSAGES;

  const sendMessage = useCallback(
    async (rawText: string) => {
      const check = sanitizeChatInput(rawText);
      if (!check.isValid) {
        setError(check.error || 'Pesan tidak valid');
        return;
      }

      if (isLimitReached) {
        setError('Batas maksimal percakapan tercapai. Silakan gunakan form kontak!');
        return;
      }

      setError(null);
      setIsLoading(true);

      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `asst-${Date.now()}`;

      const userMessage: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: check.cleaned,
        createdAt: new Date().toISOString(),
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);

      // Abort any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: check.cleaned,
            sessionId: sessionId || undefined,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Request failed with status ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Streaming body tidak ditemukan.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        // Add assistant placeholder message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
          },
        ]);

        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const events = parseSseStreamChunk(chunkText);

          for (const ev of events) {
            if (ev.type === 'session' && ev.sessionId) {
              setSessionId(ev.sessionId);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem(STORAGE_SESSION_KEY, ev.sessionId);
              }
            } else if (ev.type === 'chunk' && ev.text) {
              accumulatedContent += ev.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId ? { ...msg, content: accumulatedContent } : msg
                )
              );
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message || 'Terjadi kesalahan saat memproses chat.');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId && !msg.content
              ? {
                  ...msg,
                  content:
                    'Maaf, terjadi sedikit kendala koneksi ke server AI. Silakan coba kirim ulang pesanmu ya!',
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLimitReached]
  );

  const clearChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    }
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    isOpen,
    setIsOpen,
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    isLimitReached,
  };
}
