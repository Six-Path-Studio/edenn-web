"use client";

import { Search } from "lucide-react";

interface DirectoryHeaderProps {
  title: string;
  description: string;
}

export function DirectoryHeader({ title, description }: DirectoryHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 mb-8 pt-12 px-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight relative inline-block">
          {title}
          <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white hidden" /> {/* Underline if needed */}
        </h1>
        <p className="text-white/60 max-w-2xl text-sm md:text-base font-light leading-relaxed">
          {description}
        </p>
      </div>

      <div className="w-full max-w-2xl bg-[#111111] border border-[#222222] rounded-[24px] px-6 py-4 flex items-center gap-3 group focus-within:border-white/20 transition-all">
        <input 
          type="text" 
          placeholder="Search"
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/40"
        />
        <Search className="w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
      </div>
    </div>
  );
}
