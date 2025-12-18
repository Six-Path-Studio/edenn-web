"use client";

import Image from "next/image";

interface StudioCardProps {
  name: string;
  tags: string[];
  image: string; // The logo
}

export function StudioCard({ name, tags, image }: StudioCardProps) {
  return (
    <div className="bg-[#111111] rounded-[24px] p-6 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        {/* Logo Container */}
        <div className="w-12 h-12 rounded-full bg-white relative overflow-hidden flex items-center justify-center shrink-0">
           {/* In screenshot logo is small inside white circle */}
           <div className="relative w-8 h-8">
             <Image src={image} alt={name} fill className="object-contain" />
           </div>
        </div>
        
        {/* Info */}
        <div className="flex flex-col gap-0.5">
           <h3 className="text-white font-bold text-sm">{name}</h3>
           <span className="text-white/40 text-xs">{tags.join(" ")}</span>
        </div>
      </div>

      {/* Flag */}
      <div className="w-8 h-6 bg-black border border-white/10 rounded overflow-hidden relative shrink-0">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-green-600" />
          <div className="absolute inset-y-0 left-1/3 w-1/3 bg-white" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-green-600" />
      </div>
    </div>
  );
}
