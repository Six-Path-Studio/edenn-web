"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, Plus, Search, MoreVertical, X } from "lucide-react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import Navbar from "@/components/landing/Navbar";

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  
  // Only query if user.id is available (and cast to string if needed by backend args, though backend takes string/id)
  // Backend expects Id<"users"> or string. Let"s pass string for now.
  const conversations = useQuery(api.messages.getConversations, user?.id ? { userId: user.id as string } : "skip") || [];
  const allUsers = useQuery(api.users.getAllUsers) || [];
  
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(
    api.messages.getMessages,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );
  
  const sendMessage = useMutation(api.messages.sendMessage);
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);
  const setTypingStatus = useMutation(api.messages.setTypingStatus);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const markMessagesRead = useMutation(api.notifications.markMessagesAsRead);

  const selectedConversation = conversations.find(c => c._id === selectedConversationId);
  const otherUser = selectedConversation?.otherUser;

  // Auto-scroll to bottom & Mark Read
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConversation?.typing]);
  
  // Mark messages as read when page loads
  useEffect(() => {
    if (user?.id) {
        markMessagesRead({ userId: user.id as Id<"users"> });
    }
  }, [user?.id, markMessagesRead]);

  const handleTyping = (text: string) => {
    setMessageText(text);

    if (!selectedConversationId || !user?.id) return;

    // Set typing to true
    setTypingStatus({
      conversationId: selectedConversationId,
      userId: user.id as Id<"users">,
      isTyping: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to clear typing
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus({
        conversationId: selectedConversationId,
        userId: user.id as Id<"users">,
        isTyping: false,
      });
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId || !user?.id) return;

    const text = messageText;
    setMessageText(""); // Optimistic clear

    try {
      await sendMessage({
        conversationId: selectedConversationId,
        senderId: user.id as Id<"users">,
        text,
      });
    } catch (err) {
      console.error("Failed to send", err);
    }
  };

  const handleStartChat = async (targetUserId: Id<"users">) => {
     if (!user?.id) return;
     try {
        const conversationId = await getOrCreateConversation({ 
            currentUserId: user.id as Id<"users">,
            opponentId: targetUserId 
        });
        setSelectedConversationId(conversationId);
        setIsNewChatOpen(false);
     } catch (err) {
        console.error("Failed to create chat", err);
        alert("Could not create chat");
     }
  };

  // Filter users for new chat (exclude self)
  // Assuming user context has an ID that matches what's in the DB users table
  // The useAuth user object might differ from DB object, but usually IDs align if using standard Clerk/Auth0 sync
  // For safety, we just filter by ignoring the current user's ID if we know it.
  const filteredUsers = allUsers.filter(u => 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) && 
      // Rudimentary check to exclude self if possible, user.id from useAuth might be string 
      (user?.id ? u._id !== user.id : true)
  );

  return (
    <div className="flex flex-col h-screen bg-[#070707] text-white font-dm-sans"> 
      <Navbar isLoggedIn={isAuthenticated} />
      
      <div className="flex flex-1 pt-[88px] overflow-hidden max-w-[1600px] w-full mx-auto px-6 gap-6 pb-6">
        
        {/* Sidebar - Conversation List */}
        <div className="w-[400px] flex flex-col bg-[#111] rounded-[32px] border border-[#222] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Messages</h1>
               <button 
                  onClick={() => setIsNewChatOpen(true)}
                  className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:bg-[#262626] transition-colors border border-[#333]"
               >
                  <Plus className="w-5 h-5 text-gray-400" />
               </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#727272]" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full h-[52px] bg-[#0A0A0A] border border-[#262626] rounded-[26px] pl-12 pr-4 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#7628DB] transition-all"
                disabled 
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
             {conversations.length === 0 ? (
               <div className="text-center text-[#555] mt-10 p-6">
                 <p className="mb-2">No conversations yet.</p>
                 <button onClick={() => setIsNewChatOpen(true)} className="text-[#7628DB] text-sm hover:underline">Start a new one</button>
               </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.otherUser;
                const isActive = selectedConversationId === conv._id;
                
                return (
                  <div 
                    key={conv._id}
                    onClick={() => setSelectedConversationId(conv._id)}
                    className={`p-4 rounded-[24px] cursor-pointer transition-all duration-300 group ${
                        isActive 
                        ? 'bg-[#1A1A1A] border-[#333] shadow-lg' 
                        : 'bg-transparent border border-transparent hover:bg-[#151515]'
                    } border`}
                  >
                    <div className="flex items-center gap-4">
                        <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden bg-[#222] border border-[#333] shrink-0">
                          <Image 
                            src={(other?.avatar && (other.avatar.startsWith("http") || other.avatar.startsWith("/"))) ? other.avatar : "/images/avatar.png"} 
                            alt={other?.name || "User"} 
                            fill 
                            className="object-cover" 
                        />
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-bold text-[16px] truncate ${isActive ? 'text-white' : 'text-[#DDD]'}`}>
                            {other?.name || "Unknown User"}
                            </h3>
                            <span className="text-xs font-medium text-[#555]">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                        <p className={`text-[14px] truncate leading-relaxed ${isActive ? 'text-[#AAA]' : 'text-[#666]'}`}>
                            {conv.lastMessage || "Start chatting"}
                        </p>
                        </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#111] rounded-[32px] border border-[#222] overflow-hidden shadow-2xl relative">
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="h-[90px] border-b border-[#222] px-8 flex items-center justify-between bg-[#111] z-10">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#222] border border-[#333]">
                    <Image 
                      src={(otherUser?.avatar && (otherUser.avatar.startsWith("http") || otherUser.avatar.startsWith("/"))) ? otherUser.avatar : "/images/avatar.png"} 
                      alt={otherUser?.name || "User"} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{otherUser?.name || "Unknown"}</h2>
                    <span className="text-sm text-[#555] font-medium">@{otherUser?.name?.toLowerCase().replace(/\s/g, '')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#1A1A1A] transition-colors text-[#777]">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {messages && messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    
                    return (
                      <motion.div 
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                           <div 
                             className={`px-6 py-4 rounded-[28px] text-[16px] leading-relaxed relative shadow-sm ${
                               isMe 
                               // My Message: Purple Gradient
                                 ? 'bg-gradient-to-br from-[#7628DB] to-[#6020A0] text-white rounded-tr-md' 
                               // Other Message: Dark Card
                                 : 'bg-[#1A1A1A] text-[#DDD] border border-[#262626] rounded-tl-md'
                             }`}
                           >
                             {msg.text}
                           </div>
                           <span className="text-[12px] font-medium text-[#444] mt-2 px-2">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <Image src="/images/logo.png" width={100} height={100} alt="Logo" className="grayscale mb-4" />
                        <p className="text-[#555]">Secure Conversation</p>
                    </div>
                )}
                
                {/* Typing Indicator */}
                {selectedConversation?.typing && otherUser && selectedConversation.typing[otherUser._id] && (
                   <motion.div 
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex justify-start"
                   >
                     <div className="bg-[#1A1A1A] border border-[#262626] rounded-[24px] rounded-tl-md px-4 py-3 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#777] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#777] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#777] rounded-full animate-bounce"></span>
                     </div>
                   </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-[#111] border-t border-[#222]">
                <div className="bg-[#0A0A0A] border border-[#262626] rounded-[28px] p-2 pr-3 flex items-center gap-3 relative focus-within:border-[#7628DB] focus-within:ring-1 focus-within:ring-[#7628DB]/20 transition-all shadow-inner">
                  <button className="p-3 text-[#555] hover:text-[#CCC] transition-colors rounded-full hover:bg-[#1A1A1A]">
                    <Plus className="w-6 h-6" />
                  </button>
                  <form onSubmit={handleSend} className="flex-1">
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder="Type a message..." 
                      className="w-full bg-transparent border-none text-white focus:outline-none h-[52px] placeholder-[#444] text-[16px]"
                    />
                  </form>
                  <label className="p-3 text-[#555] hover:text-[#CCC] transition-colors rounded-full hover:bg-[#1A1A1A] cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => alert("File upload coming in next update!")} />
                    <ImageIcon className="w-5 h-5" />
                  </label>
                  <button 
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    className="w-[48px] h-[48px] flex items-center justify-center bg-[#7628DB] text-white rounded-full hover:bg-[#8a3be8] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(118,40,219,0.3)] hover:shadow-[0_6px_20px_rgba(118,40,219,0.4)] transform hover:-translate-y-0.5"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#444] space-y-6">
               <div className="w-[120px] h-[120px] rounded-full bg-[#1A1A1A] flex items-center justify-center border border-[#222] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                  <span className="text-6xl animate-pulse">👋</span>
               </div>
               <div className="text-center">
                   <h3 className="text-2xl font-bold text-[#EEE] mb-2">Welcome to Messages</h3>
                   <p className="text-[#666] max-w-sm">Select a conversation from the sidebar or start a new chat to connect with creators.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {isNewChatOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    onClick={() => setIsNewChatOpen(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#111] border border-[#333] w-full max-w-md rounded-[24px] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[80vh]"
                >
                    <div className="p-6 border-b border-[#222] flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">New Message</h2>
                        <button onClick={() => setIsNewChatOpen(false)} className="p-2 hover:bg-[#222] rounded-full text-[#777] hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4 border-b border-[#222]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                            <input 
                                type="text" 
                                placeholder="Search by name..." 
                                autoFocus
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full h-[46px] bg-[#0A0A0A] border border-[#262626] rounded-[16px] pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#7628DB]" 
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-[#555]">No users found.</div>
                        ) : (
                            filteredUsers.map(u => (
                                <button 
                                    key={u._id}
                                    onClick={() => handleStartChat(u._id)}
                                    className="w-full p-3 flex items-center gap-4 hover:bg-[#1A1A1A] rounded-[16px] transition-colors text-left group"
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#222] shrink-0 border border-[#333] group-hover:border-[#555]">
                                        <Image src={(u.avatar && (u.avatar.startsWith("http") || u.avatar.startsWith("/"))) ? u.avatar : "/images/avatar.png"} fill className="object-cover" alt={u.name || "User"} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-[15px]">{u.name}</h3>
                                        <p className="text-xs text-[#666] font-medium">@{u.name?.toLowerCase().replace(/\s/g, '') || "user"}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Send className="w-4 h-4 text-[#7628DB]" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
