"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MoreVertical, X, Paperclip, Triangle, Send, Trash2, ArrowLeft, MessageSquare } from "lucide-react"; // Added Trash2
import { SendIcon, GiftIcon, StickerIcon } from "@/components/icons/CustomIcons"; // Added Custom Icons
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#070707]" />}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdParam = searchParams.get("userId");
  
  const conversations = useQuery(api.messages.getConversations, user?.id ? { userId: user.id as string } : "skip") || [];
  const allUsers = useQuery(api.users.getAllUsers) || [];
  
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [messageText, setMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<Id<"messages"> | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<Id<"messages"> | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showTopTooltips, setShowTopTooltips] = useState(false);
  
  // New State for Preview & Zoom
  const [filePreview, setFilePreview] = useState<{ file: File; url: string; type: 'image' | 'file' } | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for Optimistic UI
  const [pendingMessages, setPendingMessages] = useState<any[]>([]); // simplified type for now

  const messages = useQuery(
    api.messages.getMessages,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );
  
  // Merge Real & Pending Messages
  const allMessages = [...(messages || []), ...pendingMessages].sort((a, b) => a.createdAt - b.createdAt);

  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage); 
  const deleteMessage = useMutation(api.messages.deleteMessage); // Added delete hook
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);
  const setTypingStatus = useMutation(api.messages.setTypingStatus);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ... imports
  const markConversationAsRead = useMutation(api.notifications.markConversationAsRead);
  
  // State for sticker picker
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);

  // Show tooltips for top buttons on mobile briefly
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile) {
      setShowTopTooltips(true);
      const timer = setTimeout(() => setShowTopTooltips(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Mark CURRENT conversation as read when selected or messages update
  useEffect(() => {
    if (selectedConversationId && user?.id && messages) {
       markConversationAsRead({ userId: user.id as Id<"users">, conversationId: selectedConversationId });
    }
  }, [selectedConversationId, user?.id, messages, markConversationAsRead]);
  
  // REMOVED global markMessagesRead on mount

  // ... typing logic ...

  // Handler for adding sticker
  const addSticker = (sticker: string) => {
      setMessageText(prev => prev + sticker);
      setIsStickerPickerOpen(false);
  };

  const toggleUpvote = useMutation(api.users.toggleUpvoteProfile); 

  const selectedConversation = conversations.find(c => c._id === selectedConversationId);
  const otherUser = selectedConversation?.otherUser;

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, selectedConversation?.typing]);

  const handleTyping = (text: string) => {
    setMessageText(text);

    if (!selectedConversationId || !user?.id) return;

    setTypingStatus({
      conversationId: selectedConversationId,
      userId: user.id as Id<"users">,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus({
        conversationId: selectedConversationId,
        userId: user.id as Id<"users">,
        isTyping: false,
      });
    }, 2000);
  };

  // 1. Handle File Selection (No Upload Yet)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isImage = file.type.startsWith("image/");
      const url = isImage ? URL.createObjectURL(file) : "";
      
      setFilePreview({
          file,
          url,
          type: isImage ? 'image' : 'file'
      });
  };

  // 2. Handle Send (Text OR File)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !filePreview) || !selectedConversationId || !user?.id) return;
    
    // Prevent double submission
    if (isUploading) return;

    const text = messageText;
    const currentFile = filePreview;
    
    // Optimistic Reset
    setMessageText(""); 
    setFilePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    
    const editingId = editingMessageId;
    setEditingMessageId(null);

    // Optimistic Message Creation
    const tempId = Date.now().toString();
    if (!editingId) {
        setPendingMessages(prev => [...prev, {
            _id: tempId,
            conversationId: selectedConversationId,
            senderId: user.id,
            text,
            imageUrl: currentFile?.type === 'image' ? currentFile.url : undefined,
            attachmentUrl: currentFile?.type === 'file' ? '#' : undefined,
            attachmentName: currentFile?.file.name,
            createdAt: Date.now(),
            isPending: true
        }]);
    }

    try {
      if (editingId) {
          // Editing existing message (Text only for now)
          await editMessage({
              messageId: editingId,
              userId: user.id as Id<"users">,
              text
          });
      } else {
        // Sending New Message
        let storageId: Id<"_storage"> | undefined = undefined;

        // A. Handle File Upload if present
        if (currentFile) {
            setIsUploading(true); // Keep global loading state for button if needed, though hidden now
            try {
                let fileToUpload = currentFile.file;
                
                // Compress if image
                if (currentFile.type === 'image') {
                    const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1200,
                        useWebWorker: true,
                    };
                    try {
                        fileToUpload = await imageCompression(currentFile.file, options);
                    } catch (error) {
                        console.error("Compression error", error);
                    }
                }

                // Get URL & Upload
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": currentFile.file.type },
                    body: fileToUpload,
                });

                if (!result.ok) throw new Error("Upload failed");
                const data = await result.json();
                storageId = data.storageId;

            } catch(err) {
                console.error("Upload process failed", err);
                toast.error("Failed to upload file");
                // Remove pending message on failure
                setPendingMessages(prev => prev.filter(m => m._id !== tempId));
                setFilePreview(currentFile); // Restore preview
                setMessageText(text);
                setIsUploading(false);
                return; 
            }
            setIsUploading(false);
        }

        // B. Send Message Mutation
        await sendMessage({
            conversationId: selectedConversationId,
            senderId: user.id as Id<"users">,
            text,
            imageUrl: currentFile?.type === 'image' ? storageId : undefined,
            attachmentUrl: currentFile?.type === 'file' ? storageId : undefined,
            attachmentName: currentFile?.file.name,
        });

        // Remove pending message on success
        setPendingMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } catch (err) {
      console.error("Failed to send", err);
      // Remove pending and restore
      setPendingMessages(prev => prev.filter(m => m._id !== tempId));
      if (editingId) {
          setMessageText(text);
          setEditingMessageId(editingId);
      }
    }
  };

  const handleStartChat = useCallback(async (targetUserId: Id<"users">) => {
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
        toast.error("Could not create chat");
     }
  }, [user?.id, getOrCreateConversation]);

  useEffect(() => {
    if (userIdParam && user?.id) {
       handleStartChat(userIdParam as Id<"users">);
       router.replace('/messages');
    }
  }, [userIdParam, user?.id, handleStartChat, router]);

  // Removed old handleFileUpload related to direct onChange

  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter(conv => 
      conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) && 
      (user?.id ? u._id !== user.id : true)
  );

  return (
    <div className="flex flex-col h-screen bg-[#070707] text-white font-dm-sans"> 
      
      <div className="flex flex-1 pt-[88px] overflow-hidden max-w-[1600px] w-full mx-auto px-4 md:px-6 gap-6 pb-6">
        
        {/* Sidebar - Conversation List */}
        <div className={`w-full md:w-[400px] flex flex-col bg-[#111] rounded-[32px] border border-[#222] overflow-hidden shadow-2xl ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..." 
                className="w-full h-[52px] bg-[#0A0A0A] border border-[#262626] rounded-[26px] pl-12 pr-4 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#7628DB] transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
             {filteredConversations.length === 0 ? (
               <div className="text-center text-[#555] mt-10 p-6">
                 <p className="mb-2">No conversations found.</p>
                 <button onClick={() => setIsNewChatOpen(true)} className="text-[#7628DB] text-sm hover:underline">Start a new one</button>
               </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.otherUser;
                const isActive = selectedConversationId === conv._id;
                
                // Typing detection
                const isTyping = other && (conv as any).typing && (conv as any).typing[other._id] && (Date.now() - (conv as any).typing[other._id] < 4000);

                return (
                  <div 
                    key={conv._id}
                    onClick={() => setSelectedConversationId(conv._id)}
                    className={`p-4 rounded-[24px] cursor-pointer transition-all duration-300 group ${
                        isActive 
                        ? 'bg-[#1A1A1A] border-[#333] shadow-lg' 
                        : 'bg-transparent border border-transparent hover:bg-[#151515]'
                    } border relative`}
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
                              <h3 className={`font-bold text-[16px] truncate max-w-[140px] ${isActive ? 'text-white' : 'text-[#DDD]'}`}>
                              {other?.name || "Unknown User"}
                              </h3>
                              <span className="text-xs font-medium text-[#555]">
                              {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                              <p className={`text-[14px] truncate leading-relaxed flex-1 ${isActive ? 'text-[#AAA]' : 'text-[#666]'}`}>
                                  {isTyping ? (
                                      <span className="text-[#4ADE80] font-medium animate-pulse flex items-center gap-1">
                                          Typing...
                                      </span>
                                  ) : (conv.lastMessage || "Start chatting")}
                              </p>
                              {/* Unread Bubble - Bottom Right */}
                              {(conv as any).unreadCount > 0 && (
                                  <div className="min-w-[20px] h-5 px-1.5 bg-[#7628DB] rounded-full flex items-center justify-center border border-[#111] shrink-0">
                                      <span className="text-[10px] font-bold text-white">{(conv as any).unreadCount}</span>
                                  </div>
                              )}
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex-col bg-[#111] rounded-[32px] border border-[#222] overflow-hidden shadow-2xl relative ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="h-[80px] md:h-[90px] border-b border-[#222] px-4 md:px-8 flex items-center justify-between bg-[#111] z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedConversationId(null)}
                    className="md:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-[#222] border border-[#333] shrink-0">
                    <Image 
                      src={(otherUser?.avatar && (otherUser.avatar.startsWith("http") || otherUser.avatar.startsWith("/"))) ? otherUser.avatar : "/images/avatar.png"} 
                      alt={otherUser?.name || "User"} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base md:text-xl font-bold text-white truncate max-w-[80px] sm:max-w-[150px] md:max-w-none">{otherUser?.name || "Unknown"}</h2>
                    <span className="text-xs md:text-sm text-[#555] font-medium block truncate max-w-[80px] sm:max-w-[150px] md:max-w-none">@{otherUser?.name?.toLowerCase().replace(/\s/g, '')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   {/* Send Gift */}
                   <div className="relative">
                       <AnimatePresence>
                           {showTopTooltips && (
                               <motion.div 
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   exit={{ opacity: 0, y: 10 }}
                                   className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#7628DB] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50 lg:hidden shadow-lg border border-white/10"
                               >
                                   Send Gifts
                                   <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#7628DB] rotate-45 border-t border-l border-white/10" />
                               </motion.div>
                           )}
                       </AnimatePresence>
                       <button 
                         onClick={() => toast.info("Gifting coming soon!")}
                         className="h-10 px-3 md:px-4 rounded-full border border-[#40A261] text-[#40A261] flex items-center gap-2 hover:bg-[#40A261]/10 transition-colors text-xs md:text-sm font-bold shrink-0"
                       >
                           <GiftIcon />
                           <span className="hidden sm:inline">Send a gift</span>
                       </button>
                   </div>

                   {/* Upvote */}
                   <div className="relative">
                       <AnimatePresence>
                           {showTopTooltips && (
                               <motion.div 
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   exit={{ opacity: 0, y: 10 }}
                                   className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#7628DB] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50 lg:hidden shadow-lg border border-white/10"
                               >
                                   Upvote Profile
                                   <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#7628DB] rotate-45 border-t border-l border-white/10" />
                               </motion.div>
                           )}
                       </AnimatePresence>
                       <button 
                         onClick={async () => {
                             if (!user?.id || !otherUser?._id) return;
                             await toggleUpvote({ userId: user.id as Id<"users">, targetId: otherUser._id });
                         }}
                         className={`h-10 px-3 md:px-4 rounded-full flex items-center gap-1.5 md:gap-2 transition-colors text-xs md:text-sm font-bold shrink-0 ${
                             otherUser?.upvotedBy?.some((id: any) => id === user?.id)
                             ? "bg-[#4ADE80] text-black"
                             : "bg-[#7628DB] text-white hover:bg-[#8a3be8]"
                         }`}
                       >
                           <Triangle className={`w-3 h-3 ${otherUser?.upvotedBy?.some((id: any) => id === user?.id) ? "fill-black" : "fill-white"}`} />
                           <span className="hidden sm:inline">{otherUser?.upvotedBy?.some((id: any) => id === user?.id) ? "Upvoted" : "Upvote"} • </span>
                           <span>{otherUser?.upvotes || 0}</span>
                       </button>
                   </div>
                   
                   <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-[#1A1A1A] transition-colors text-[#777] shrink-0">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3">
                {allMessages && allMessages.length > 0 ? (
                  allMessages.map((msg, index) => {
                    const isMe = msg.senderId === user?.id;
                    const nextMsg = allMessages[index + 1];
                    const prevMsg = allMessages[index - 1];

                    const isSameSenderAsNext = nextMsg?.senderId === msg.senderId;
                    const isSameSenderAsPrev = prevMsg?.senderId === msg.senderId;
                    
                    // Group if sent within 2 minutes of adjacent message
                    const isCloseToNext = nextMsg && (nextMsg.createdAt - msg.createdAt < 2 * 60 * 1000);
                    const isCloseToPrev = prevMsg && (msg.createdAt - prevMsg.createdAt < 2 * 60 * 1000);

                    const showTimestamp = !isSameSenderAsNext || !isCloseToNext;
                    const isGrouped = isSameSenderAsPrev && isCloseToPrev;

                    return (
                      <motion.div 
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/message ${isGrouped ? 'mt-px' : 'mt-2'}`}
                      >
                        <div className={`max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-center gap-2 relative">
                               {isMe && !msg.isPending && (
                                   <div className="opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center relative">
                                       <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownId(activeDropdownId === msg._id ? null : msg._id);
                                        }}
                                        className={`p-1.5 rounded-full ${activeDropdownId === msg._id ? 'bg-[#222] text-white' : 'hover:bg-[#222] text-[#666] hover:text-white'} transition-colors`}
                                       >
                                           <MoreVertical width="14" height="14" />
                                       </button>
                                       
                                       <AnimatePresence>
                                       {activeDropdownId === msg._id && (
                                           <motion.div 
                                             initial={{ opacity: 0, scale: 0.9 }}
                                             animate={{ opacity: 1, scale: 1 }}
                                             exit={{ opacity: 0, scale: 0.9 }}
                                             className="absolute top-8 right-0 bg-[#1A1A1A] border border-[#262626] rounded-xl shadow-xl z-50 min-w-[120px] overflow-hidden flex flex-col p-1"
                                           >
                                               <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingMessageId(msg._id);
                                                        setMessageText(msg.text);
                                                        setActiveDropdownId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm text-[#DDD] hover:bg-[#222] hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                                                >
                                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                   Edit
                                                </button>
                                                <button 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!user?.id) return;
                                                        try {
                                                            await deleteMessage({ messageId: msg._id, userId: user.id as Id<"users"> });
                                                            toast.success("Message deleted");
                                                        } catch(err) {
                                                            toast.error("Failed to delete");
                                                        } finally {
                                                            setActiveDropdownId(null);
                                                        }
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[#2A1111] hover:text-red-400 rounded-lg flex items-center gap-2 transition-colors"
                                                >
                                                   <Trash2 width="14" height="14" />
                                                   Delete
                                                </button>
                                           </motion.div>
                                       )}
                                       </AnimatePresence>
                                   </div>
                               )}
                               <div 
                                 className={`px-3 py-2 text-[15px] leading-relaxed relative shadow-sm break-words ${
                                   isMe 
                                   // My Message
                                     ? 'bg-linear-to-br from-[#7628DB] to-[#6020A0] text-white' 
                                   // Other Message
                                     : 'bg-[#1A1A1A] text-[#DDD] border border-[#262626]'
                                 } ${
                                    // Corner Logic
                                    isMe 
                                        ? `rounded-[22px] ${isGrouped ? 'rounded-tr-md' : 'rounded-tr-[22px]'} ${isSameSenderAsNext && isCloseToNext ? 'rounded-br-md' : 'rounded-br-[22px]'}`
                                        : `rounded-[22px] ${isGrouped ? 'rounded-tl-md' : 'rounded-tl-[22px]'} ${isSameSenderAsNext && isCloseToNext ? 'rounded-bl-md' : 'rounded-bl-[22px]'}`
                                 } ${msg.isPending ? 'opacity-80' : ''}`}
                               >
                                 {(msg as any).imageUrl && (
                                   <>
                                     <div 
                                        onClick={() => !msg.isPending && setZoomedImage(msg.imageUrl)}
                                        className={`mb-2 relative rounded-[12px] overflow-hidden border border-white/10 ${!msg.isPending ? 'cursor-zoom-in' : ''}`}
                                     >
                                        <img 
                                          src={(msg as any).imageUrl} 
                                          alt="Sent image" 
                                          className="max-w-full max-h-[300px] object-contain"
                                        />
                                        {msg.isPending && (
                                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                               <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                           </div>
                                        )}
                                     </div>
                                   </>
                                 )}
                                 {(msg as any).attachmentUrl && (
                                   <a 
                                      href={(msg as any).attachmentUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 bg-black/20 p-3 rounded-xl mb-2 hover:bg-black/30 transition-colors border border-white/5"
                                   >
                                      <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
                                          <Paperclip size={18} className="text-[#8AF0C5]" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{(msg as any).attachmentName || "File"}</p>
                                          <p className="text-[10px] opacity-50 uppercase font-bold">Download File</p>
                                      </div>
                                   </a>
                                 )}
                                 {msg.text}
                               </div>
                           </div>
                           {showTimestamp && (
                               <span className={`text-[11px] font-medium text-[#444] mt-1 px-2 select-none ${isMe ? 'text-right' : 'text-left'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {msg.isPending && " • Sending..."}
                               </span>
                           )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <div className="w-20 h-20 bg-[#222] rounded-2xl flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-[#7628DB]" />
                        </div>
                        <p className="text-[#555] font-dm-sans">Secure Conversation</p>
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

               {/* Zoom Overlay */}
               <AnimatePresence>
                 {zoomedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomedImage(null)}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md"
                    >
                        <motion.img 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={zoomedImage}
                            alt="Full screen"
                            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                        />
                        <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </motion.div>
                 )}
               </AnimatePresence>

              {/* Input Area */}
              <div className="p-6 bg-[#070707] border-t border-[#111]">
                 {editingMessageId && (
                     <div className="flex items-center justify-between mb-2 text-xs text-[#7628DB] px-4">
                         <span>Editing message...</span>
                         <button onClick={() => { setEditingMessageId(null); setMessageText(""); }} className="hover:text-white">Cancel</button>
                     </div>
                 )}
                 
                 {/* File Preview */}
                 <AnimatePresence>
                    {filePreview && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            className="flex items-center gap-3 bg-[#111] p-3 rounded-2xl mb-4 border border-[#222]"
                        >
                             {filePreview.type === 'image' ? (
                                 <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                                     <img src={filePreview.url} alt="To send" className="w-full h-full object-cover" />
                                 </div>
                             ) : (
                                  <div className="w-12 h-12 rounded-lg bg-[#222] flex items-center justify-center">
                                      <Paperclip className="w-5 h-5 text-[#8AF0C5]" />
                                  </div>
                             )}
                             <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium text-white truncate">{filePreview.file.name}</p>
                                 <p className="text-xs text-[#666]">{(filePreview.file.size / 1024 / 1024).toFixed(2)} MB</p>
                             </div>
                             <div className="flex items-center gap-2">
                                 {isUploading && <div className="w-4 h-4 border-2 border-[#7628DB] border-t-transparent rounded-full animate-spin" />}
                                 <button 
                                     onClick={() => {
                                         setFilePreview(null);
                                         if(fileInputRef.current) fileInputRef.current.value = "";
                                     }}
                                     className="p-2 hover:bg-[#222] rounded-full text-[#666] hover:text-white transition-colors"
                                 >
                                     <X className="w-4 h-4" />
                                 </button>
                             </div>
                        </motion.div>
                    )}
                 </AnimatePresence>

                <div className="flex items-center gap-3">
                    {/* Paperclip */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileSelect}
                    />
                    <button 
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 rounded-[16px] bg-[#111] border border-[#222] flex items-center justify-center hover:bg-[#1A1A1A] hover:border-[#333] transition-all shrink-0 relative group"
                    >
                        <Paperclip className="w-5 h-5 text-[#8AF0C5] group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Input */}
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                            <button 
                                onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
                                className="hover:opacity-80 transition-opacity"
                            >
                                <StickerIcon />
                            </button>
                            
                            {isStickerPickerOpen && (
                                <div className="absolute bottom-10 left-0 bg-[#1A1A1A] border border-[#333] rounded-[16px] p-2 grid grid-cols-4 gap-2 w-[160px] shadow-xl z-50">
                                    {["🔥", "👍", "❤️", "😂", "😮", "🎉", "👋", "👀"].map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => addSticker(emoji)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-[#333] rounded-md text-xl"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSend}>
                            <input 
                              type="text" 
                              value={messageText}
                              onChange={(e) => handleTyping(e.target.value)}
                              placeholder={filePreview ? "Add a caption..." : "Write a message..."} 
                              className="w-full h-[52px] bg-[#111] border border-[#222] rounded-[16px] pl-12 pr-4 text-white text-[15px] placeholder-[#444] focus:outline-none focus:border-[#7628DB] focus:bg-[#151515] transition-all"
                            />
                        </form>
                    </div>

                    {/* Send Button */}
                    <button 
                      onClick={handleSend}
                      disabled={!messageText.trim() && !filePreview || isUploading}
                      className="w-12 h-12 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                       <div className="relative">
                            {isUploading && <div className="absolute inset-0 border-2 border-[#7628DB] border-t-transparent rounded-full animate-spin" />}
                            <SendIcon />
                       </div>
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
