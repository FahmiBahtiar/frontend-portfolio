'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, RotateCcw, Bot, Sparkles, ExternalLink } from 'lucide-react';
import { useChatbot } from '@/lib/hooks/useChatbot';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

export function ChatWidget() {
  const {
    isOpen,
    setIsOpen,
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    isLimitReached,
  } = useChatbot();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[90vw] sm:w-[380px] h-[520px] max-h-[80vh] flex flex-col rounded-2xl bg-[#E2F4F3]/95 backdrop-blur-md border border-[#6FD4E1]/40 shadow-2xl overflow-hidden mb-3"
            style={{
              boxShadow: '0 12px 40px -10px rgba(12, 40, 45, 0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#B9E7E6]/70 border-b border-[#6FD4E1]/30 backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full bg-[#6FD4E1] flex items-center justify-center text-[#0c282d] border border-white/60 shadow-xs">
                  <Bot className="w-4 h-4" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-[#0c282d] flex items-center gap-1.5">
                    Blimbing Assistant
                    <Sparkles className="w-3 h-3 text-[#2d5a63]" />
                  </h3>
                  <p className="text-[10px] text-[#2d5a63]">Online • Siap Menjawab</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Bersihkan Percakapan"
                    className="p-1.5 rounded-lg text-[#2d5a63] hover:text-[#0c282d] hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Tutup Chat"
                  className="p-1.5 rounded-lg text-[#2d5a63] hover:text-[#0c282d] hover:bg-white/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-red-50 text-red-700 text-[11px] px-3.5 py-2 border-b border-red-200">
                {error}
              </div>
            )}

            {/* Message List */}
            <ChatMessageList messages={messages} isLoading={isLoading} />

            {/* Session Limit Banner */}
            {isLimitReached && (
              <div className="px-3.5 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-[11px] flex items-center justify-between">
                <span>Batas 20 pesan tercapai. Butuh info lebih lanjut?</span>
                <a
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1 font-semibold underline hover:text-amber-900 ml-2"
                >
                  Kontak <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}

            {/* Input Bar */}
            <ChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              disabled={isLimitReached}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-[#0c282d] hover:bg-[#163e46] text-[#6FD4E1] flex items-center justify-center shadow-lg border border-[#6FD4E1]/40 cursor-pointer transition-colors relative"
        aria-label={isOpen ? 'Tutup Chatbot' : 'Buka Chatbot'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6FD4E1] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6FD4E1]" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
