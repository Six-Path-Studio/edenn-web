"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquare, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<"home" | "user" | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("edenn_user_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const displayName = profile?.username || "Markcus";

  const toggleDropdown = (name: "home" | "user") => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md" onClick={() => setActiveDropdown(null)}>
      <Container className="flex items-center justify-between py-4 relative">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image 
            src="/images/edenn.svg" 
            alt="Edenn Logo" 
            width={100} 
            height={32} 
            className="h-8 w-auto"
          />
        </div>

        {/* Center: Nav Links + Search */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${activeDropdown === 'home' ? 'text-white' : 'text-accent'}`}
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
                <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                  Contact Us
                </Link>
              </div>
            )}
          </div>

          <Link href="/studios" className="text-text-secondary hover:text-white transition-colors text-sm font-medium">
            Studios
          </Link>
          <Link href="/games" className="text-text-secondary hover:text-white transition-colors text-sm font-medium">
            Games
          </Link>
          <Link href="/creators" className="text-text-secondary hover:text-white transition-colors text-sm font-medium">
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

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* Icons */}
              <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full border border-[#3c3c3c] bg-[#171717] text-white hover:bg-white/10 transition-colors">
                      <Bell className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full border border-[#3c3c3c] bg-[#171717] text-white hover:bg-white/10 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                  </button>
              </div>

              {/* Separator */}
              <div className="h-8 w-[1px] bg-[#3c3c3c] mx-1 hidden sm:block"></div>

              {/* User Profile */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div 
                  className="hidden sm:flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleDropdown("user")}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative">
                    <Image 
                      src="/images/avatar.png" 
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
                    <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Upload
                    </Link>
                    <Link href="/profile" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Profile
                    </Link>
                    <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Settings
                    </Link>
                    <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Sign In Link */}
              <Link href="#" className="text-white text-sm font-medium hover:text-white/80 transition-colors">
                Sign in
              </Link>

              {/* Get Started Button */}
              <Link href="/onboarding" className="w-[148px] h-[54px] flex items-center justify-center bg-primary hover:bg-primary/90 active:scale-95 text-white font-medium text-sm rounded-[60px] py-[3px] px-[6px] transition-all duration-300 ease-out">
                Get Started
              </Link>
            </>
          )}
        </div>
      </Container>
    </nav>
  );
}
