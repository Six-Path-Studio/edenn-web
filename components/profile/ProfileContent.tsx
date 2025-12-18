"use client";

import Image from "next/image";
import { Folder } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";
import "swiper/css";
import "swiper/css/pagination";

// --- Types ---
interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  handle: string;
  avatar: string;
}

// --- Mock Data ---
const portfolioItems: PortfolioItem[] = Array(6).fill({
  id: "1",
  image: "/images/onboarding/sideimageman.jpg", // leveraging existing image
  title: "Unbroken",
  handle: "@Raven Illusion Studio",
  avatar: "/images/avatar.png",
});

const socialLinks = [
  { platform: "Tiktok", handle: "Manjalee" },
  { platform: "Youtube", handle: "Manjalee" },
  { platform: "X (twitter)", handle: "Manjalee" },
  { platform: "Instagram", handle: "Manjalee" },
  { platform: "Twitch", handle: "Manjalee" },
];

interface UserProfile {
  userType: "studio" | "creator" | null;
  studioName?: string;
  username: string;
  country: string;
  career: string;
  about: string;
  socials: Record<string, string>;
}

export default function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("edenn_user_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const isCreator = profile?.userType === "creator";
  const displayTitle = isCreator ? "Personal Portfolio" : "Studio Portfolio";
  const displayAboutLabel = isCreator ? "About Creator" : "About Creator";
  const displayDescTitle = isCreator ? "Personal Details:" : "About studio:";
  const displayDesc = profile?.about || "Lorem ipsum dolor sit amet consectetur. Urna fauc ibus tempus ultrices a cliquam in donec lacus velit.";
  const displayLocation = profile?.country || "Lagos, Nigeria";
  
  // Safely map socials, ensuring we have array even if empty object
  const socialEntries = Object.entries(profile?.socials || {});
  const hasSocials = socialEntries.length > 0;
  
  // Default mock links if none
  const defaultSocials = [
    { platform: "Tiktok", handle: "Manjalee" },
    { platform: "Youtube", handle: "Manjalee" },
    { platform: "X (twitter)", handle: "Manjalee" },
    { platform: "Instagram", handle: "Manjalee" },
    { platform: "Twitch", handle: "Manjalee" },
  ];

  const displaySocials = hasSocials 
    ? socialEntries.map(([k, v]) => ({ platform: k, handle: v || "Link" }))
    : defaultSocials;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* --- Left Column (Main Content) --- */}
      <div className="lg:col-span-8 flex flex-col gap-12">
        
        {/* Featured Section */}
        <div className="bg-[#111111] rounded-[32px] p-8 pb-6 flex flex-col gap-6">
          <h2 className="text-white text-xl font-medium text-center">Featured</h2>
          
          {/* Featured Slider */}
          <div className="w-full aspect-video rounded-[24px] overflow-hidden relative group">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              autoplay={{
                delay: 6000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                el: ".featured-pagination",
                bulletClass: "inline-block w-2 h-1.5 bg-white/20 rounded-full mx-1 cursor-pointer transition-all duration-300",
                bulletActiveClass: "!w-10 !bg-[#8b5cf6]",
              }}
              loop={true}
              className="w-full h-full"
            >
              {[1, 2, 3].map((_, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full bg-[#1A1A1A]">
                    {/* Placeholder image for featured content */}
                     <Image 
                        src="/images/onboarding/sideimageman.jpg" 
                        alt="Featured" 
                        fill 
                        className="object-cover opacity-80"
                      />
                     <div className="absolute inset-0 flex items-center justify-center">
                        {/* Play button or overlay content could go here */}
                     </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Custom Pagination Container */}
          <div className="featured-pagination flex justify-center gap-0 mt-2 min-h-[6px]" />
        </div>

        {/* Portfolio Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-normal text-white mb-3">{displayTitle}</h2>
            <p className="text-white/60 text-sm">
              Skip the hassle of building from scratch. Get a fully functional AI agent asap
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {portfolioItems.map((item, idx) => (
                <div key={idx} className="bg-[#111111] rounded-[24px] p-3 flex flex-col gap-3 group">
                   {/* Card Image */}
                   <div className="relative aspect-4/3 rounded-[20px] overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                        WIP
                      </div>
                   </div>

                   {/* Card Footer */}
                   <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 relative">
                           <Image src={item.avatar} alt="Avatar" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-white text-xs font-bold">{item.title}</span>
                           <span className="text-white/40 text-[10px]">{item.handle}</span>
                        </div>
                      </div>
                      
                      <button className="h-7 px-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[10px] font-bold rounded-full transition-colors">
                        Link
                      </button>
                   </div>
                </div>
             ))}
          </div>
        </div>

      </div>

      {/* --- Right Column (Sidebar) --- */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* About Creator Card */}
        <div className="bg-[#111111] rounded-[32px] p-6 flex flex-col gap-6">
           <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Folder className="w-5 h-5 text-white/80 fill-white/10" />
              <span className="text-white font-medium">{displayAboutLabel}</span>
           </div>

           <div className="flex flex-col gap-1">
              <h3 className="text-white/60 text-sm">{displayDescTitle}</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {displayDesc}
              </p>
           </div>

           <div className="flex items-center justify-between pt-2">
              <span className="text-white/60 text-sm">Location:</span>
              <span className="text-white/40 text-sm text-right">{displayLocation}</span>
           </div>

           {isCreator && (
             <>
               <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Languages:</span>
                  <span className="text-white/40 text-sm text-right">English, French.</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Gender:</span>
                  <span className="text-white/40 text-sm text-right">Male</span>
               </div>
             </>
           )}

           {!isCreator && (
             <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Website:</span>
                <a href="#" className="text-[#Eab308] text-sm hover:underline">www.dirtymonkey.com</a>
             </div>
           )}
        </div>

        {/* Job Card (Only for Creators) */}
        {isCreator && (
          <div className="bg-[#111111] rounded-[32px] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-2">
              <Folder className="w-5 h-5 text-white/80 fill-white/10" />
              <div className="flex-1 flex justify-between items-center">
                <span className="text-white font-medium">Job</span>
                <span className="text-white/20 text-xs text-right cursor-pointer hover:text-white">edit</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <span className="text-white text-sm">Resumé / CV</span>
               <button className="bg-[#2a2a2a] hover:bg-[#333] text-[#4ade80] text-xs px-4 py-1.5 rounded-full transition-colors">
                 Manjalee
               </button>
            </div>

            <div className="flex items-center justify-between">
               <span className="text-white text-sm">ETH Wallet</span>
               <button className="bg-[#2a2a2a] hover:bg-[#333] text-[#4ade80] text-xs px-4 py-1.5 rounded-full transition-colors">
                 Copy
               </button>
            </div>
          </div>
        )}

        {/* Social Links Card */}
        <div className="bg-[#111111] rounded-[32px] p-6 flex flex-col gap-4">
           <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-2">
              <Folder className="w-5 h-5 text-white/80 fill-white/10" />
              <span className="text-white font-medium">Social Links</span>
           </div>

           <div className="flex flex-col gap-4">
              {displaySocials.map((social) => (
                 <div key={social.platform} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <span className="text-white text-sm capitalize">{social.platform}
                      {social.platform.toLowerCase().includes('x') ? ':' : social.platform.endsWith(':') ? '' : ':'}
                    </span>
                    <button className="bg-[#2a2a2a] hover:bg-[#333] text-[#4ade80] text-xs px-4 py-1.5 rounded-full transition-colors">
                      {social.handle}
                    </button>
                 </div>
              ))}
           </div>
        </div>

      </div>

    </div>
  );
}
