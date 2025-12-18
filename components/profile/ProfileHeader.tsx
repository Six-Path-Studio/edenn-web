"use client";

import Image from "next/image";
import { MessageSquare, Triangle } from "lucide-react";
import { useEffect, useState } from "react";

interface UserProfile {
  userType: "studio" | "creator" | null;
  studioName?: string;
  username: string;
  country: string;
  career: string;
  about: string;
  socials: Record<string, string>;
  profileImage?: string;
  coverImage?: string;
}

export default function ProfileHeader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("edenn_user_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Default values if no profile found (or while loading)
  const displayName = profile?.userType === "studio" ? profile.studioName : (profile?.username || "Manjalee");
  const displayAbout = profile?.about || "Lorem ipsum dolor sit ame";
  const displayCountry = profile?.country || "Nigeria";
  const isCreator = profile?.userType === "creator";

  return (
    <div className="w-full max-w-[1400px] mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Cover Image Container */}
      <div className="relative w-full aspect-21/9 sm:aspect-21/7 rounded-[32px] overflow-hidden bg-[#1A1A1A]">
        <Image
          src="/images/onboarding/sideimageman.jpg" // Using an existing image as placeholder
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient Overlay for better text visibility if needed */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 sm:px-10 -mt-[75px] sm:-mt-[100px] flex flex-col lg:flex-row items-start lg:items-end gap-6 z-10">
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full p-1.5 bg-[#121212]"> {/* Dark bg wrapper acting as border/space */}
             <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white">
                <Image
                  src="/images/avatar.png" // Placeholder
                  alt="Profile"
                  fill
                  className="object-cover"
                />
             </div>
          </div>
        </div>

        {/* User Info Content */}
        <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row items-end sm:items-end justify-between gap-6 pb-2">
          
          {/* Name & Desc */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#A855F7] tracking-tight">
              {displayName}
            </h1>
            <p className="text-white/60 text-sm sm:text-base font-light">
              {displayAbout}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Upvote */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-white group-hover:bg-[#252525] transition-colors">
                <span className="font-bold text-lg">232</span>
              </button>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#A855F7]">
                <Triangle className="w-2 h-2 fill-current rotate-180" /> {/* Simulate Up caret? No, screenshot has triangle */}
                <span>Upvote</span>
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 group-hover:bg-[#252525] transition-colors">
                {/* Nigeria Flag Placeholder (green-white-green) */}
                <div className="w-6 h-4 flex border border-white/10 overflow-hidden rounded-[2px]">
                   <div className="w-1/3 bg-green-600 h-full"></div>
                   <div className="w-1/3 bg-white h-full"></div>
                   <div className="w-1/3 bg-green-600 h-full"></div>
                </div>
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                Nigeria
              </div>
            </div>

            {/* Gift Token */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#6366f1] group-hover:bg-[#252525] transition-colors">
                 {/* Ethereum-ish Icon */}
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                 </svg>
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                Gift Token
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-white group-hover:bg-[#252525] transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                Message
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
