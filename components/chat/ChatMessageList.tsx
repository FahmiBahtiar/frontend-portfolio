'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, User, Sparkles } from 'lucide-react';
import type { ChatMessage } from '@/lib/hooks/useChatbot';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-[#6FD4E1]/40">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#6FD4E1]/20 flex items-center justify-center text-[#0c282d] shadow-sm">
            <Sparkles className="w-6 h-6 text-[#0c282d]" />
          </div>
          <div>
            <h4 className="font-semibold text-[#0c282d] text-sm">Blimbing AI Assistant</h4>
            <p className="text-xs text-[#2d5a63] mt-1 max-w-[240px] leading-relaxed">
              Hai! Ada yang ingin kamu tanyakan seputar pengalaman, proyek, atau keahlian Fahmi?
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-w-[280px]">
            {[
              'Siapa itu Fahmi?',
              'Apa proyek terbarunya?',
              'Tech stack apa yang dikuasai?',
            ].map((suggestion, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-white/70 text-[#0c282d] border border-[#B9E7E6] px-2.5 py-1 rounded-full cursor-default select-none shadow-xs"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      ) : (
        messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium shadow-xs ${
                  isUser
                    ? 'bg-[#0c282d] text-white'
                    : 'bg-[#6FD4E1] text-[#0c282d] border border-[#B9E7E6]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#0c282d] text-white rounded-tr-none'
                    : 'bg-white/90 text-[#0c282d] border border-[#B9E7E6] rounded-tl-none backdrop-blur-xs'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content || '...'}</p>
              </div>
            </motion.div>
          );
        })
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-[#2d5a63] pt-1"
        >
          <div className="w-7 h-7 rounded-full bg-[#6FD4E1]/30 flex items-center justify-center shrink-0 text-[#0c282d]">
            <Bot className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="bg-white/70 border border-[#B9E7E6] px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FD4E1] animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#6FD4E1] animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#6FD4E1] animate-bounce"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
