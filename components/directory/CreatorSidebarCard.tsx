"use client";

import Image from "next/image";

interface CreatorSidebarCardProps {
  name: string;
  tags: string[];
  upvotes: number;
}

export function CreatorSidebarCard({ name, tags, upvotes }: CreatorSidebarCardProps) {
  return (
    <div className="bg-[#111827] rounded-[24px] p-4 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-3">
         {/* Small circular logo area */}
         <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
            {/* Generic initials or logo */}
            <span className="text-black font-black text-xs">HG</span>
         </div>
         <div className="flex flex-col min-w-0">
            <h3 className="text-white font-bold text-sm tracking-tight truncate">{name}</h3>
            <span className="text-white/40 text-[10px] font-medium truncate">
                {tags && tags.length > 0 ? tags.map(t => `#${t.replace(/\s+/g, '')}`).join(" ") : "#Creator #Gaming"}
            </span>
         </div>
      </div>
      
      <div className="flex items-center gap-2">
         {/* Flag in dark box */}
         <div className="bg-black/40 p-2 px-2.5 rounded-lg border border-white/5">
            <div className="w-5 h-3 flex border border-white/10 rounded-[1px] overflow-hidden shrink-0">
               <div className="w-1/3 bg-[#008751] h-full" />
               <div className="w-1/3 bg-white h-full" />
               <div className="w-1/3 bg-[#008751] h-full" />
            </div>
         </div>
         {/* Upvote Pill in dark box */}
         <div className="bg-black/40 border border-white/5 rounded-lg p-2 px-2.5 text-[10px] font-black text-white flex items-center gap-1">
            <span className="text-[#A855F7] text-[10px]">▲</span>
            {upvotes}
         </div>
      </div>
    </div>
  );
}
