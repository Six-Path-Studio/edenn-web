"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

interface GameCardProps {
  image: string;
  title: string;
  studio: string;
}

export function GameCard({ image, title, studio }: GameCardProps) {
  return (
    <div className="group bg-[#0a0a0a] rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
      {/* Image Area */}
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges/Overlays could go here */}
      </div>

      {/* Content Area */}
      <div className="p-5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden relative shrink-0">
               {/* Placeholder Avatar */}
               <Image src="/images/avatar.png" alt="Avatar" fill className="object-cover" />
            </div>
            <div>
               <h3 className="text-white font-bold text-base leading-tight">{title}</h3>
               <p className="text-white/40 text-xs">{studio}</p>
            </div>
         </div>

         <button className="w-10 h-10 rounded-full border border-[#7628db] text-[#7628db] flex items-center justify-center hover:bg-[#7628db] hover:text-white transition-all">
            <Plus className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
}
