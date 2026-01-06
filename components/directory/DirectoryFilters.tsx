"use client";

import { MapPin, LayoutGrid, Triangle } from "lucide-react";

export function DirectoryFilters() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12 px-2 sm:px-0 auto-scroll-mobile">
      <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-sm font-medium">
        <MapPin className="w-4 h-4 text-[#eab308]" /> {/* Yellow icon */}
        Location
      </button>

      <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-sm font-medium">
        <LayoutGrid className="w-4 h-4 text-[#f87171]" /> {/* Red/Pink icon */}
        Genre
      </button>

      <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-sm font-medium">
        <Triangle className="w-4 h-4 fill-[#4ade80] text-[#4ade80] rotate-0" /> {/* Green Upvote icon */}
        Upvote
      </button>
    </div>
  );
}
