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
        <h1 className="text-[32px] sm:text-[42px] md:text-[52px] lg:text-[63.6px] font-bold font-power text-white tracking-tight relative inline-block">
          {title}
          <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white hidden" /> {/* Underline if needed */}
        </h1>
        <p className="text-white/60 max-w-2xl text-sm md:text-base font-preahvihear font-light leading-relaxed">
          {description}
        </p>
      </div>

      
    </div>
  );
}
