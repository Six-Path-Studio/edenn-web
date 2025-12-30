"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Triangle, Loader2, Edit2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProfileHeader() {
  const { user } = useAuth();
  
  // Fetch user data from Convex
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  // Loading state
  if (!dbUser) {
    return (
      <div className="w-full max-w-[1400px] mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative w-full aspect-21/9 sm:aspect-21/7 rounded-[32px] overflow-hidden bg-[#1A1A1A] animate-pulse" />
        <div className="relative px-6 sm:px-10 -mt-[75px] sm:-mt-[100px] flex items-end gap-6 z-10">
          <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full bg-[#1A1A1A] animate-pulse" />
          <div className="flex-1 pb-2">
            <div className="h-12 w-48 bg-[#1A1A1A] rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-[#1A1A1A] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // User data from Convex
  const displayName = dbUser.name || user?.name || "User";
  const displayBio = dbUser.bio || "No bio yet";
  const displayLocation = dbUser.location || "Location not set";
  const isCreator = dbUser.role === "creator";
  
  // Helper to validate image URLs
  const getValidImageUrl = (url: string | undefined, fallback: string): string => {
    if (!url || url.trim() === "" || url === "undefined" || url === "null") return fallback;
    // Check if it's a valid relative path or absolute URL
    if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return fallback;
  };
  
  // Use Convex storage URLs for images, with fallbacks
  const coverImageUrl = getValidImageUrl(dbUser.coverImage, "/images/onboarding/sideimageman.jpg");
  const avatarUrl = getValidImageUrl(dbUser.avatar || user?.avatar, "/images/avatar.png");

  return (
    <div className="w-full max-w-[1400px] mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Cover Image Container */}
      <div className="relative w-full aspect-21/9 sm:aspect-21/7 rounded-[32px] overflow-hidden bg-[#1A1A1A]">
        <Image
          src={coverImageUrl}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient Overlay for better text visibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 sm:px-10 -mt-[75px] sm:-mt-[100px] flex flex-col lg:flex-row items-start lg:items-end gap-6 z-10">
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full p-1.5 bg-[#121212]">
             <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white">
                <Image
                  src={avatarUrl}
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
              {displayBio}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Upvote */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-white group-hover:bg-[#252525] transition-colors">
                <span className="font-bold text-lg">0</span>
              </button>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#A855F7]">
                <Triangle className="w-2 h-2 fill-current rotate-180" />
                <span>Upvote</span>
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 group-hover:bg-[#252525] transition-colors overflow-hidden">
                {dbUser.locationFlag ? (
                  <span className="text-2xl">{dbUser.locationFlag}</span>
                ) : (
                  <div className="w-6 h-4 flex border border-white/10 overflow-hidden rounded-[2px]">
                    <div className="w-1/3 bg-green-600 h-full"></div>
                    <div className="w-1/3 bg-white h-full"></div>
                    <div className="w-1/3 bg-green-600 h-full"></div>
                  </div>
                )}
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                {displayLocation.split(',')[0] || displayLocation}
              </div>
            </div>

            {/* Gift Token */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#6366f1] group-hover:bg-[#252525] transition-colors">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                 </svg>
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                Gift Token
              </div>
            </div>

            {/* Message */}
            <Link href="/messages" className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-white group-hover:bg-[#252525] transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                Message
              </div>
            </Link>

            {/* Edit Profile (Owner only) */}
            <Link href="/settings" className="flex flex-col items-center gap-1 group cursor-pointer">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#7628db] border border-white/5 text-white hover:bg-[#8b3eff] transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                Edit Profile
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
