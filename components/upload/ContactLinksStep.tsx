"use client";

import { GameFormData } from "@/app/upload-game/page";

interface ContactLinksStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  formData: GameFormData;
  updateData: (data: Partial<GameFormData>) => void;
}

export default function ContactLinksStep({ onNext, onSkip, formData, updateData }: ContactLinksStepProps) {
  
  const handleInputChange = (field: string, value: string) => {
    updateData({
      socials: {
        ...formData.socials,
        [field]: value
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-preahvihear mb-4 text-center">
        Contact links
      </h1>
      <p className="text-white/40 font-dm-sans mb-12 text-center">
        Provide links to where players can find you
      </p>

      <div className="w-full space-y-5">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Instagram"
            value={formData.socials.instagram || ""}
            onChange={(e) => handleInputChange("instagram", e.target.value)}
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="TikTok"
            value={formData.socials.tiktok || ""}
            onChange={(e) => handleInputChange("tiktok", e.target.value)}
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Twitter / X"
            value={formData.socials.twitter || ""}
            onChange={(e) => handleInputChange("twitter", e.target.value)}
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="YouTube"
            value={formData.socials.youtube || ""}
            onChange={(e) => handleInputChange("youtube", e.target.value)}
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Twitch"
            value={formData.socials.twitch || ""}
            onChange={(e) => handleInputChange("twitch", e.target.value)}
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
        </div>
      </div>

      <div className="mt-12 w-full flex items-center justify-between gap-6">
        <button 
          onClick={onNext}
          className="flex-1 bg-primary hover:bg-[#8b3eff] text-white py-3.5 rounded-full font-dm-sans font-semibold transition-all active:scale-95"
        >
          Proceed
        </button>
        <button 
          onClick={onSkip}
          className="flex-1 bg-[#333] hover:bg-[#444] text-white py-3.5 rounded-full font-dm-sans font-semibold transition-all active:scale-95"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
