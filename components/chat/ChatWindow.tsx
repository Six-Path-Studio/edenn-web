"use client";

import { User, Send, Paperclip, Smile, Triangle } from "lucide-react";

interface ChatWindowProps {
  chatName: string | null;
}

export default function ChatWindow({ chatName }: ChatWindowProps) {
  if (!chatName) {
    return (
      <div className="h-full flex items-center justify-center text-white/20">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-8">
      {/* Header */}
      <div className="px-8 pb-6 flex items-center justify-between border-b border-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#3c4a7e] flex items-center justify-center">
            <User size={24} className="text-white/80" />
          </div>
          <div>
            <h2 className="font-dm-sans font-bold text-lg">{chatName}</h2>
            <p className="text-xs text-white/40 font-dm-sans">Wait, what do you mean its gone....</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2 border border-green-500/30 rounded-full hover:bg-green-500/5 transition-all text-xs font-dm-sans font-medium text-white/90">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">E</div>
            Send a gift
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#7628db] rounded-full hover:bg-[#8b3eff] transition-all text-xs font-dm-sans font-medium text-white shadow-[0_4px_15px_rgba(118,40,219,0.3)]">
            <Triangle className="fill-white rotate-180" size={12} />
            Upvote • 43
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 flex flex-col custom-scrollbar">
        {/* Date Divider */}
        <div className="flex justify-center">
          <span className="text-[10px] text-white/20 font-dm-sans">11/03/26, 9:02 AM</span>
        </div>

        {/* Incoming Message */}
        <div className="flex items-start gap-4 max-w-[80%]">
          <div className="w-10 h-10 rounded-full bg-[#3c4a7e] flex items-center justify-center shrink-0">
            <User size={20} className="text-white/80" />
          </div>
          <div className="bg-[#161616] p-4 rounded-2xl rounded-tl-none">
            <p className="text-sm font-dm-sans text-white/60 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Uma fauc ibus tempus ultrices a aliquam in donec lacus velit. Amet nunc la
            </p>
          </div>
        </div>

        {/* Outgoing Message */}
        <div className="flex items-start gap-4 self-end max-w-[80%] flex-row-reverse">
          <div className="w-10 h-10 rounded-full bg-[#1db954]/20 flex items-center justify-center shrink-0 border border-[#1db954]/30">
            <User size={20} className="text-[#1db954]" />
          </div>
          <div className="bg-[#7628db] p-5 rounded-3xl rounded-tr-none">
            <p className="text-sm font-dm-sans text-white leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Uma fauc ibus tempus ultrices a aliquam in donec lacus velit. Amet nunc l
            </p>
          </div>
        </div>

        {/* Short Incoming */}
        <div className="flex items-start gap-4 max-w-[80%]">
          <div className="w-10 h-10 rounded-full bg-[#3c4a7e] flex items-center justify-center shrink-0">
            <User size={20} className="text-white/80" />
          </div>
          <div className="bg-[#161616] px-5 py-4 rounded-3xl rounded-tl-none">
            <p className="text-sm font-dm-sans text-white/60">
              Lorem ipsum dolor sit amet consectetur.
            </p>
          </div>
        </div>

        {/* Date Divider */}
        <div className="flex justify-center pt-4">
          <span className="text-[10px] text-white/20 font-dm-sans">11/03/26, 9:02 AM</span>
        </div>

        {/* Another Outgoing */}
        <div className="flex items-start gap-4 self-end max-w-[80%] flex-row-reverse">
          <div className="w-10 h-10 rounded-full bg-[#1db954]/20 flex items-center justify-center shrink-0 border border-[#1db954]/30">
            <User size={20} className="text-[#1db954]" />
          </div>
          <div className="bg-[#7628db] p-5 rounded-3xl rounded-tr-none">
            <p className="text-sm font-dm-sans text-white leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Uma fauc ibus tempus ultrices a aliquam in donec lacus velit. Amet nunc l
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8">
        <div className="flex items-center gap-4">
          <button className="text-white/20 hover:text-white transition-colors">
            <Paperclip size={24} />
          </button>
          
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-5 text-[#7628db]">
              <Smile size={20} />
            </div>
            <input 
              type="text" 
              placeholder="click to type message"
              className="w-full bg-[#111111] border border-[#222222] rounded-2xl py-4 pl-14 pr-4 text-sm font-dm-sans outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <button className="bg-transparent text-[#7628db] hover:scale-110 transition-transform">
            <Send size={28} className="rotate-[-15deg]" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
