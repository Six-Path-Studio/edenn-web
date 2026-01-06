"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquare, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import LogoutModal from "@/components/ui/LogoutModal";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<"home" | "user" | "notifications" | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user data from Convex
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  const displayName = dbUser?.name || user?.name || "User";

  // Auto-logout if user exists locally but not in DB (stale session)
  useEffect(() => {
    if (user && dbUser === null) {
      console.warn("User not found in DB, signing out...");
      signOut();
    }
  }, [user, dbUser, signOut]);
  
  // Real notifications
  const activeNotifications = useQuery(api.notifications.getNotifications, user?.id ? { userId: user.id } : "skip") || [];
  const unreadMessageCount = useQuery(api.notifications.getUnreadMessageCount, user?.id ? { userId: user.id } : "skip") || 0;
  const unreadNotificationCount = useQuery(api.notifications.getUnreadNotificationCount, user?.id ? { userId: user.id } : "skip") || 0;
  const markNotificationsAsRead = useMutation(api.notifications.markNotificationsAsRead);
  
  // Helper to validate image URLs
  const getValidImageUrl = (url: string | undefined, fallback: string): string => {
    if (!url || url.trim() === "" || url === "undefined") return fallback;
    if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return fallback;
  };

  const avatarUrl = getValidImageUrl(dbUser?.avatar || user?.avatar, "/images/avatar.png");

  const toggleDropdown = (name: "home" | "user" | "notifications") => {
    setActiveDropdown(prev => prev === name ? null : name);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // Scroll lock removed for floating menu style

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-trigger') && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-toggle')) {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    if (activeDropdown || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, isMobileMenuOpen]);



  // Helper for active class
  const getLinkClass = (path: string) => {
    return pathname === path 
      ? "text-white font-medium text-sm transition-colors"
      : "text-text-secondary hover:text-white transition-colors text-sm font-medium";
  };

  const mobileLinkClass = (path: string) => {
     return pathname === path
      ? "text-white text-lg font-bold"
      : "text-text-secondary hover:text-white text-lg font-bold transition-colors";
  };

  return (
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none transition-all duration-300 ${scrolled ? 'pt-2' : 'pt-6'}`}>
      <Container className={`flex items-center justify-between py-4 relative pointer-events-auto z-101 transition-all duration-300 rounded-[32px] ${
        scrolled 
          ? 'bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] px-6' 
          : 'bg-transparent border-transparent px-4'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer relative z-102">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <Image 
              src="/images/edenn.svg" 
              alt="Edenn Logo" 
              width={100} 
              height={32} 
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Center: Nav Links + Search */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative dropdown-trigger">
            <button 
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${activeDropdown === 'home' ? 'text-[#EBCF61]' : 'text-accent'}`}
              onClick={() => toggleDropdown("home")}
            >
              Home <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'home' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Home Dropdown */}
            {activeDropdown === "home" && (
              <div className="absolute top-full left-0 mt-4 w-[180px] bg-[#111111] border border-[#222] rounded-[24px] p-2 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                  Company
                </Link>
                <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                  Blog
                </Link>
                <Link href="/contact" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                  Contact Us
                </Link>
              </div>
            )}
          </div>

          <Link href="/studios" className={getLinkClass("/studios")}>
            Studios
          </Link>
          <Link href="/games" className={getLinkClass("/games")}>
            Games
          </Link>
          <Link href="/creators" className={getLinkClass("/creators")}>
            Creators
          </Link>

          {/* Search Pill - Smaller */}
          <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#3c3c3c] rounded-full px-3 py-1.5 w-36 text-text-secondary">
            <Search className="w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-secondary text-white"
            />
          </div>
        </div>

        {/* Right Side Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {(isLoggedIn || isAuthenticated) ? (
            <>
              {/* Icons */}
              <div className="flex items-center gap-2">
                  <div className="relative dropdown-trigger">
                    <button 
                      onClick={() => toggleDropdown("notifications")}
                      className={`p-2 rounded-full border border-[#3c3c3c] bg-[#171717] hover:bg-white/10 transition-colors ${activeDropdown === "notifications" ? "text-white border-white" : "text-white"} relative`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadNotificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#171717]">
                            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                          </span>
                        )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {activeDropdown === "notifications" && (
                      <div className="absolute top-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-4 w-[360px] bg-[#111111] border border-[#222] rounded-[24px] p-0 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#222]">
                          <span className="text-white text-lg font-medium">Notification</span>
                          <button 
                            onClick={async () => {
                                if (user?.id) {
                                    await markNotificationsAsRead({ userId: user.id as any });
                                }
                            }}
                            className="text-[#7628DB] text-sm hover:text-white transition-colors font-medium"
                          >
                            Mark as read
                          </button>
                        </div>
                        
                        {/* List */}
                        <div className="flex flex-col max-h-[400px] overflow-y-auto">
                           {activeNotifications.length === 0 ? (
                             <div className="px-6 py-8 text-center text-gray-500 text-sm">No new notifications</div>
                           ) : (
                             activeNotifications.map((notif: any, i: number) => (
                               <div key={i} className="flex gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-b border-[#222]/50 last:border-0 cursor-pointer">
                                  {/* Icon */}
                                  <div className="shrink-0 mt-1">
                                    {notif.type === 'upvote' && (
                                      <div className="w-5 h-5 text-[#4ADE80]">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 4L4 20H20L12 4Z" /></svg>
                                      </div>
                                    )}
                                    {notif.type === 'upload' && (
                                        <div className="w-6 h-6 text-[#A855F7] bg-[#A855F7]/10 p-1 rounded-full flex items-center justify-center">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        </div>
                                    )}
                                    {notif.type === 'follow' && (
                                        <div className="w-6 h-6 text-[#3B82F6] bg-[#3B82F6]/10 p-1 rounded-full flex items-center justify-center">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                        </div>
                                    )}
                                    {!['upvote', 'upload', 'follow'].includes(notif.type) && (
                                       <div className="w-5 h-5 text-gray-400"><Bell className="w-full h-full" /></div>
                                    )}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex flex-col gap-1">
                                    <p className="text-[#D4D4D4] text-sm leading-snug">
                                      {notif.type === 'upvote' && (
                                        <>
                                          <span className="text-white font-medium">{notif.sender?.name || "Someone"}</span> just sent you an upvote
                                        </>
                                      )}
                                      {notif.type === 'upload' && (
                                        <>
                                           <span className="text-white font-medium">Your Game</span> has been uploaded successfully
                                        </>
                                      )}
                                      {notif.type === 'follow' && (
                                          <>
                                              <span className="text-white font-medium">{notif.sender?.name || "Someone"}</span> started following you
                                          </>
                                      )}
                                      {!['upvote', 'upload', 'follow'].includes(notif.type) && (
                                         <span>New notification</span>
                                      )}
                                    </p>
                                    <span className="text-[#525252] text-xs">
                                      {new Date(notif.createdAt).toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date(notif.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                  </div>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link href="/messages" className="p-2 rounded-full border border-[#3c3c3c] bg-[#171717] text-white hover:bg-white/10 transition-colors relative">
                      <MessageSquare className="w-5 h-5" />
                      {unreadMessageCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#171717]">
                          {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                        </span>
                      )}
                  </Link>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-[#3c3c3c] mx-1 hidden sm:block"></div>

              {/* User Profile */}
              <div className="relative dropdown-trigger">
                <div 
                  className="hidden sm:flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleDropdown("user")}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative">
                    <Image 
                      src={avatarUrl} 
                      alt="User" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-white">{displayName}</span>
                    <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* User Dropdown */}
                {activeDropdown === "user" && (
                  <div className="absolute top-full right-0 mt-4 w-[200px] bg-[#111111] border border-[#222] rounded-[24px] p-2 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <Link href="/upload-game" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Upload
                    </Link>
                    <Link href="/profile" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Profile
                    </Link>
                    <Link href="/settings" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Settings
                    </Link>
                    <button 
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors text-left w-full"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Sign In Link */}
              <Link href="/signin" className="text-white text-sm font-medium hover:text-white/80 transition-colors">
                Sign in
              </Link>

              {/* Get Started Button */}
              <Link href="/onboarding" className="w-[148px] h-[54px] flex items-center justify-center bg-primary hover:bg-primary/90 active:scale-95 text-white font-medium text-sm rounded-[60px] py-[3px] px-[6px] transition-all duration-300 ease-out">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden relative z-102">
           {(isLoggedIn || isAuthenticated) && (
              <div className="flex items-center gap-2">
                 <Link href="/messages" className="p-2 text-white relative">
                      <MessageSquare className="w-5 h-5" />
                      {unreadMessageCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                          {unreadMessageCount}
                        </span>
                      )}
                  </Link>
                  <div className="relative dropdown-trigger">
                    <button 
                        onClick={() => toggleDropdown("notifications")}
                        className="p-2 text-white relative"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadNotificationCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                            {unreadNotificationCount}
                            </span>
                        )}
                    </button>
                    {/* Mobile Notification Dropdown */}
                    {activeDropdown === "notifications" && (
                         <div className="absolute top-full right-0 mt-4 w-[280px] xs:w-[320px] bg-[#111111] border border-[#222] rounded-[24px] overflow-hidden shadow-2xl z-200 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                                    <span className="text-white text-base font-medium">Notifications</span>
                                    <button 
                                        onClick={async () => {
                                            if (user?.id) {
                                                await markNotificationsAsRead({ userId: user.id as any });
                                            }
                                        }}
                                        className="text-[#7628DB] text-xs hover:text-white transition-colors font-medium"
                                    >
                                        Mark all read
                                    </button>
                                </div>
                                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                                    {activeNotifications.length === 0 ? (
                                        <div className="px-6 py-8 text-center text-gray-500 text-sm">No new notifications</div>
                                    ) : (
                                        activeNotifications.map((notif: any, i: number) => (
                                        <div key={i} className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-[#222]/50 last:border-0 cursor-pointer text-left">
                                            <div className="shrink-0 mt-1">
                                                {notif.type === 'upvote' && <div className="w-4 h-4 text-[#4ADE80]"><svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 4L4 20H20L12 4Z" /></svg></div>}
                                                {notif.type === 'upload' && <div className="w-5 h-5 text-[#A855F7] bg-[#A855F7]/10 p-1 rounded-full flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>}
                                                {notif.type === 'follow' && <div className="w-5 h-5 text-[#3B82F6] bg-[#3B82F6]/10 p-1 rounded-full flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></div>}
                                                {!['upvote', 'upload', 'follow'].includes(notif.type) && <div className="w-4 h-4 text-gray-400"><Bell className="w-full h-full" /></div>}
                                            </div>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <p className="text-[#D4D4D4] text-[13px] leading-snug line-clamp-2">
                                                    {notif.type === 'upvote' && <><span className="text-white font-medium">{notif.sender?.name || "Someone"}</span> upvoted you</>}
                                                    {notif.type === 'upload' && <><span className="text-white font-medium">Your Game</span> uploaded</>}
                                                    {notif.type === 'follow' && <><span className="text-white font-medium">{notif.sender?.name || "Someone"}</span> followed you</>}
                                                    {!['upvote', 'upload', 'follow'].includes(notif.type) && <span>New notification</span>}
                                                </p>
                                                <span className="text-[#525252] text-[10px]">{new Date(notif.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        ))
                                    )}
                                </div>
                         </div>
                    )}
                  </div>

                  {/* Mobile Avatar Dropdown */}
                  <div className="relative dropdown-trigger">
                    <button 
                        onClick={() => toggleDropdown("user")}
                        className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 ml-1 block"
                    >
                        <Image 
                            src={avatarUrl} 
                            alt="User" 
                            fill 
                            className="object-cover"
                        />
                    </button>
                    {activeDropdown === "user" && (
                         <div className="absolute top-full right-0 mt-4 w-[200px] bg-[#111111] border border-[#222] rounded-[24px] p-2 flex flex-col shadow-2xl z-200 animate-in fade-in zoom-in-95 duration-200">
                            <Link href="/upload-game" onClick={() => setActiveDropdown(null)} className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                            Upload
                            </Link>
                            <Link href="/profile" onClick={() => setActiveDropdown(null)} className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                            Profile
                            </Link>
                            <Link href="/settings" onClick={() => setActiveDropdown(null)} className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                            Settings
                            </Link>
                            <button 
                            onClick={() => {
                                setActiveDropdown(null);
                                setIsLogoutModalOpen(true);
                            }}
                            className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors text-left w-full"
                            >
                            Logout
                            </button>
                        </div>
                    )}
                  </div>
              </div>
           )}
           <button 
            onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setActiveDropdown(null);
            }}
            className="text-white p-2 mobile-menu-toggle"
           >
             {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
             )}
           </button>
        </div>

      </Container>
      
      {/* Mobile Menu - Floating Purplish Glassmorphism */}
      <div 
        className={`fixed top-[100px] left-4 right-4 z-40 transition-all duration-300 ease-out md:hidden flex flex-col p-6 rounded-[32px] border border-purple-500/20 bg-[#0f0a1ac0] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(118,40,219,0.15)] mobile-menu ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
          <div className="flex flex-col gap-5">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/")}>
                Home
              </Link>
              <Link href="/studios" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/studios")}>
                Studios
              </Link>
              <Link href="/games" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/games")}>
                Games
              </Link>
              <Link href="/creators" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/creators")}>
                Creators
              </Link>
              
              <div className="h-px bg-[#222] w-full my-2"></div>
              
              <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a1a1aa] text-lg font-medium">
                  Company
              </Link>
              <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a1a1aa] text-lg font-medium">
                  Blog
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a1a1aa] text-lg font-medium">
                  Contact Us
              </Link>

              <div className="h-px bg-[#222] w-full my-2"></div>

              {(isLoggedIn || isAuthenticated) ? (
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative">
                            <Image 
                              src={avatarUrl} 
                              alt="User" 
                              fill 
                              className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-medium">{displayName}</span>
                            <span className="text-white/50 text-xs">{user?.email}</span>
                        </div>
                     </div>
                  </div>
              ) : (
                  <div className="flex flex-col gap-4">
                      <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-lg font-medium">
                        Sign In
                      </Link>
                      <Link href="/onboarding" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary text-white text-center py-3 rounded-full font-medium">
                        Get Started
                      </Link>
                  </div>
              )}
          </div>
      </div>
      
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          signOut();
          // Use window.location.href for a full fresh state reset on home page
          window.location.href = "/";
        }}
      />
    </div>
  );
}
