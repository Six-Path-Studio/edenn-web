"use client";

import { Bell, MessageSquare, Twitter, Instagram } from "lucide-react";

export default function HelpSupportSection() {
  const socials = [
    { icon: <Bell size={18} />, label: "Support" },
    { icon: <MessageSquare size={18} />, label: "Chat" },
    { icon: <Twitter size={18} />, label: "X" },
    { icon: <Instagram size={18} />, label: "Instagram" },
  ];

  return (
    <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-5xl font-preahvihear text-white tracking-tight mb-12">Help & Support</h1>

      <div className="border-t border-white/5 pt-12 space-y-12">
        {/* Socials */}
        <div className="flex items-center gap-8">
          <span className="text-white/40 font-dm-sans">Visit our Socials</span>
          <div className="flex gap-4">
            {socials.map((social, i) => (
              <button key={i} className="w-10 h-10 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all">
                {social.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <h3 className="text-white font-dm-sans font-medium opacity-60">Drop a complaint / Suggestion</h3>
          <div className="grid grid-cols-2 gap-6 max-w-3xl">
            <input type="text" placeholder="Subject" className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-5 py-4 outline-none focus:border-primary text-white" />
            <div className="relative">
              <select className="w-full h-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-5 py-4 outline-none font-dm-sans text-white/40 appearance-none">
                <option>Categories</option>
              </select>
            </div>
            <textarea placeholder="Enter message" rows={6} className="col-span-2 w-full bg-[#050505] border border-[#1a1a1a] rounded-[32px] px-6 py-5 outline-none focus:border-primary text-white resize-none" />
          </div>
          <button className="bg-primary hover:bg-[#8b3eff] text-white px-14 py-3.5 rounded-full font-dm-sans font-bold transition-all shadow-lg min-w-[140px]">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
