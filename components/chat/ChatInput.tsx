'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { MAX_MESSAGE_CHARS } from '@/lib/chat/chat-helpers';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isLoading || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const remainingChars = MAX_MESSAGE_CHARS - text.length;
  const isOverLimit = remainingChars < 0;

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-[#B9E7E6] bg-white/60 backdrop-blur-xs">
      <div className="relative flex items-center bg-white border border-[#B9E7E6] rounded-xl focus-within:border-[#6FD4E1] focus-within:ring-1 focus-within:ring-[#6FD4E1] transition-all shadow-xs">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Batas sesi tercapai...' : 'Tanya seputar portfolio Fahmi...'}
          disabled={disabled || isLoading}
          rows={1}
          maxLength={MAX_MESSAGE_CHARS + 50}
          className="w-full resize-none py-2.5 pl-3 pr-10 text-xs text-[#0c282d] placeholder:text-[#2d5a63]/50 focus:outline-none disabled:opacity-50 max-h-24"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading || disabled || isOverLimit}
          className="absolute right-1.5 p-1.5 rounded-lg bg-[#0c282d] text-white hover:bg-[#2d5a63] disabled:opacity-30 disabled:hover:bg-[#0c282d] transition-all cursor-pointer disabled:cursor-not-allowed"
          aria-label="Kirim Pesan"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-[#2d5a63]/70">
        <span>Tekan Enter untuk mengirim</span>
        <span className={isOverLimit ? 'text-red-500 font-semibold' : ''}>
          {text.length}/{MAX_MESSAGE_CHARS}
        </span>
      </div>
    </form>
  );
}
