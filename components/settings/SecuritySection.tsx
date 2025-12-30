"use client";

import { Shield, Smartphone, Key } from "lucide-react";

export default function SecuritySection() {
  return (
    <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-5xl font-preahvihear text-white tracking-tight mb-12">Security</h1>

      <div className="border-t border-white/5 pt-12 space-y-10">
        <div className="space-y-8">
          <h3 className="text-white font-dm-sans text-lg opacity-80">
            Change password
          </h3>
          <div className="flex flex-col gap-6 max-w-[440px]">
            <input 
              type="password" 
              placeholder="Enter Old password" 
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary/50 text-white font-dm-sans transition-all" 
            />
            <input 
              type="password" 
              placeholder="Enter new password" 
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary/50 text-white font-dm-sans transition-all" 
            />
            <input 
              type="password" 
              placeholder="Enter new password" 
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary/50 text-white font-dm-sans transition-all" 
            />
          </div>
          
          <div className="pt-4">
            <button className="bg-primary hover:bg-[#8b3eff] text-white px-14 py-4 rounded-full font-dm-sans font-bold transition-all shadow-[0_4px_20px_rgba(118,40,219,0.3)] active:scale-95">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
