"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface UploadDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadDoneModal({ isOpen, onClose }: UploadDoneModalProps) {
  const router = useRouter();

  const handleGoHome = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[360px] bg-[#0d0d0d] border border-white/10 rounded-[32px] p-10 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <h2 className="text-white text-2xl font-semibold font-dm-sans mb-8">
              Done
            </h2>

            {/* SVG Icon Container */}
            <div className="mb-6">
              <svg width="120" height="120" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="130.253" cy="22.2199" rx="7.95985" ry="8.06342" fill="url(#paint0_done_modal)"/>
                <ellipse cx="89.1376" cy="10.035" rx="3.61811" ry="3.66519" fill="url(#paint1_done_modal)"/>
                <ellipse cx="26.7753" cy="8.79646" rx="8.68347" ry="8.79646" fill="url(#paint2_done_modal)"/>
                <ellipse cx="132.424" cy="120.449" rx="5.78898" ry="5.86431" fill="url(#paint3_done_modal)"/>
                <ellipse cx="3.61811" cy="80.1375" rx="3.61811" ry="3.66519" fill="url(#paint4_done_modal)"/>
                <ellipse cx="140.382" cy="68.402" rx="3.61811" ry="3.66519" fill="url(#paint5_done_modal)"/>
                <ellipse cx="33.4179" cy="138.136" rx="5.78898" ry="5.86431" fill="url(#paint6_done_modal)"/>
                <ellipse cx="76.0826" cy="77.2766" rx="58.0826" ry="58.2766" fill="url(#paint7_done_modal)"/>
                <path d="M94.5801 59.4365L97.9287 62.7949L98.9834 63.8544L97.9287 64.913L69.4355 93.5019L68.373 94.5673L67.3105 93.5019L54.0371 80.1845L52.9785 79.121L54.041 78.0624L57.4131 74.7031L58.4746 73.6454L59.5342 74.707L68.373 83.5751L92.4561 59.4355L93.5186 58.371L94.5801 59.4365Z" fill="#101010" stroke="#101010" strokeWidth="3"/>
                <defs>
                  <linearGradient id="paint0_done_modal" x1="138.213" y1="22.2199" x2="122.293" y2="22.2199" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                  <linearGradient id="paint1_done_modal" x1="92.7558" y1="10.035" x2="85.5195" y2="10.035" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                  <linearGradient id="paint2_done_modal" x1="35.4587" y1="8.79646" x2="18.0918" y2="8.79646" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                  <linearGradient id="paint3_done_modal" x1="138.213" y1="120.449" x2="126.635" y2="120.449" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                  <linearGradient id="paint4_done_modal" x1="7.23622" y1="80.1375" x2="0" y2="80.1375" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                  <linearGradient id="paint5_done_modal" x1="144" y1="68.402" x2="136.764" y2="68.402" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                  <linearGradient id="paint6_done_modal" x1="39.2069" y1="138.136" x2="27.6289" y2="138.136" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                  <linearGradient id="paint7_done_modal" x1="134.165" y1="77.2766" x2="18" y2="77.2766" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A86CF5"/>
                    <stop offset="1" stopColor="#40A261"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-white/40 text-sm font-dm-sans mb-8">Checked In</p>

            {/* Homepage Button */}
            <button
              onClick={handleGoHome}
              className="w-full max-w-[200px] bg-primary hover:bg-[#8b3eff] text-white py-3.5 rounded-full font-dm-sans font-semibold transition-all active:scale-95 shadow-[0_4px_15px_rgba(118,40,219,0.3)]"
            >
              Homepage
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
