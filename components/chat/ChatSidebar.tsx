"use client";

import { Search, User } from "lucide-react";

const conversations = [
  { id: "1", name: "Silversnow Emmanuel", lastMessage: "Lorem ipsum dolor si", time: "9:02 AM" },
  { id: "2", name: "Paulo Metro", lastMessage: "Lorem ipsum dolor si", time: "9:02 AM" },
  { id: "3", name: "Super Nintendo", lastMessage: "Lorem ipsum dolor si", time: "9:02 AM" },
  { id: "4", name: "Michael Wilson", lastMessage: "Lorem ipsum dolor si", time: "9:02 AM" },
  { id: "5", name: "Juju Games", lastMessage: "Lorem ipsum dolor si", time: "9:02 AM" },
  { id: "6", name: "Sharon Charity", lastMessage: "Lorem ipsum dolor si", time: "9:02 AM" },
  { id: "7", name: "Mercy Christopher", lastMessage: "Lorem ipsum dolor si", time: "9:02 AM" },
];

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (name: string) => void;
}

export default function ChatSidebar({ selectedChat, onSelectChat }: ChatSidebarProps) {
  return (
    <div className="h-full flex flex-col pt-8 space-y-6">
      {/* Search Bar */}
      <div className="px-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search Message"
            className="w-full bg-[#111111] border border-[#222222] rounded-full py-2.5 pl-11 pr-4 outline-none focus:border-primary/50 transition-colors font-dm-sans text-sm"
          />
        </div>
      </div>

      <div className="border-t border-[#1a1a1a]" />

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        {conversations.map((chat) => (
          <div 
            key={chat.id}
            onClick={() => onSelectChat(chat.name)}
            className={`flex items-center gap-4 px-3 py-4 rounded-2xl cursor-pointer transition-all ${
              selectedChat === chat.name ? "bg-[#161616]" : "hover:bg-[#111111]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#3c4a7e] flex items-center justify-center shrink-0">
              <User size={24} className="text-white/80" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-dm-sans font-bold text-sm truncate">{chat.name}</h3>
                <span className="text-[10px] text-white/30 whitespace-nowrap">{chat.time}</span>
              </div>
              <p className="text-xs text-white/40 truncate font-dm-sans">
                {chat.lastMessage}
              </p>
            </div>
          </div>
        ))}
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
