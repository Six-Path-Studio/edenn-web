"use client";

import Image from "next/image";

export default function BillingSection() {
  return (
    <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-6 sm:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl sm:text-5xl font-preahvihear text-white tracking-tight mb-8 sm:mb-12">Billing</h1>

      <div className="border-t border-white/5 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111] border border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl">
              <span className="text-white/40 font-dm-sans text-sm">Coming Soon</span>
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative opacity-80">
                <Image src="/images/edenn.svg" alt="Edenn" fill className="object-contain filter grayscale invert" />
              </div>
              <button className="w-full bg-[#1a1a1a] text-white/20 py-3 rounded-full font-dm-sans text-sm cursor-not-allowed">
                ...Loading
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
