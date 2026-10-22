'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  X,
} from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}: DeleteDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-[#0c282d]"
            >
              {/* Header */}
              <div className="bg-red-50/80 border-b border-red-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#0c282d] mb-1">{title}</h2>
                    <p className="text-[#527d85] text-sm font-medium">{description}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-[#527d85] hover:text-[#0c282d] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {itemName && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50/50 border border-red-200">
                    <p className="text-[#527d85] text-sm mb-1 font-semibold">You are about to delete:</p>
                    <p className="text-[#0c282d] font-bold">{itemName}</p>
                  </div>
                )}
                <p className="text-[#527d85] text-sm font-medium">
                  This action cannot be undone. This will permanently delete the data from the server.
                </p>
              </div>

              {/* Actions */}
              <div className="bg-[#E2F4F3]/30 border-t border-[#B9E7E6] p-6 flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white hover:bg-[#E2F4F3] border border-[#B9E7E6] text-[#0c282d] font-bold transition-all disabled:opacity-50 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
