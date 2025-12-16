"use client";

import { useState } from "react";
import { Bell, MessageSquare, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";

export default function Navbar() {
  // Toggle this to switch between logged in and logged out states
  const [isLoggedIn] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
      <Container className="flex items-center justify-between py-4">
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
          <Link href="#" className="flex items-center gap-1 text-accent font-medium text-sm">
            Home <ChevronDown className="w-4 h-4" />
          </Link>
          <Link href="#" className="text-text-secondary hover:text-white transition-colors text-sm font-medium">
            Studios
          </Link>
          <Link href="#" className="text-text-secondary hover:text-white transition-colors text-sm font-medium">
            Games
          </Link>
          <Link href="#" className="text-text-secondary hover:text-white transition-colors text-sm font-medium">
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
              <div className="hidden sm:flex items-center gap-3 cursor-pointer">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative">
                   <Image 
                     src="/images/avatar.png" 
                     alt="User" 
                     fill 
                     className="object-cover"
                   />
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-sm font-medium text-white">Markcus</span>
                   <ChevronDown className="w-4 h-4 text-text-secondary" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sign In Link */}
              <Link href="#" className="text-white text-sm font-medium hover:text-white/80 transition-colors">
                Sign in
              </Link>

              {/* Get Started Button */}
              <button className="w-[148px] h-[54px] bg-primary hover:bg-primary/90 active:scale-95 text-white font-medium text-sm rounded-[60px] py-[3px] px-[6px] transition-all duration-300 ease-out">
                Get Started
              </button>
            </>
          )}
        </div>
      </Container>
    </nav>
  );
}
