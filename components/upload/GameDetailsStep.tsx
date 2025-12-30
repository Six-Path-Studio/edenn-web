"use client";

import { ChevronDown, Globe } from "lucide-react";
import { GameFormData } from "@/app/upload-game/page";

interface GameDetailsStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: GameFormData;
  updateData: (data: Partial<GameFormData>) => void;
}

export default function GameDetailsStep({ onNext, formData, updateData }: GameDetailsStepProps) {
  
  const handleNext = () => {
    if (formData.title.trim()) {
      onNext();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-preahvihear mb-12 text-center">
        Upload your game
      </h1>

      <div className="w-full space-y-5">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Game Name"
            value={formData.title}
            onChange={(e) => updateData({ title: e.target.value })}
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30">
            <Globe size={18} />
          </div>
        </div>

        <div className="relative cursor-pointer">
          <input 
            type="text" 
            placeholder="Location (e.g. London, UK)"
            value={formData.location}
            onChange={(e) => updateData({ location: e.target.value })}
            className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
        </div>

        <div className="relative cursor-pointer">
          <div className="relative">
             <select 
               value={formData.category}
               onChange={(e) => updateData({ category: e.target.value })}
               className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 appearance-none outline-none focus:border-primary transition-colors font-dm-sans text-white/60"
             >
                <option value="" disabled>Choose Category</option>
                <option value="Action">Action</option>
                <option value="Adventure">Adventure</option>
                <option value="RPG">RPG</option>
                <option value="Strategy">Strategy</option>
                <option value="Sports">Sports</option>
                <option value="Simulation">Simulation</option>
             </select>
             <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        <textarea 
          placeholder="About Game"
          rows={6}
          value={formData.description}
          onChange={(e) => updateData({ description: e.target.value })}
          className="w-full bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans resize-none"
        />
      </div>

      <button 
        onClick={handleNext}
        disabled={!formData.title.trim()}
        className="mt-12 bg-primary hover:bg-[#8b3eff] text-white px-14 py-3.5 rounded-full font-dm-sans font-semibold transition-all active:scale-95 flex items-center justify-center min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Proceed
      </button>

      <style jsx>{`
        h1 {
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
