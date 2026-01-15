"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  description?: string;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  confirmText = "Yes, Confirm", 
  cancelText = "No, Cancel",
  description
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[440px] bg-[#0d0d0d] border border-white/10 rounded-[40px] p-10 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <h2 className="text-white text-2xl font-semibold font-dm-sans mb-4 text-center">
              {title}
            </h2>
            
            {description && (
              <p className="text-white/60 text-center mb-8 font-dm-sans">
                {description}
              </p>
            )}

            {/* Buttons Container */}
            <div className="w-full flex gap-4 mt-4">
              <button
                onClick={onClose}
                className="flex-1 border border-white/20 hover:bg-white/5 text-white py-4 rounded-full font-dm-sans font-semibold transition-all active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-full font-dm-sans font-semibold transition-all active:scale-95 shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
