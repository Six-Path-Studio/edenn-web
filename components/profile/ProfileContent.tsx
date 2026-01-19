"use client";

import Link from "next/link";
import Image from "next/image";
import { Folder, Upload, Edit2, Triangle } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import "swiper/css";
import "swiper/css/pagination";

export default function ProfileContent() {
  const { user } = useAuth();
  const upvoteGame = useMutation(api.games.upvoteGame);
  
  // Fetch user data from Convex
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  // Fetch viewing user's data for upvoting (the person logged in)
  const currentUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  // Fetch user's games from Convex
  const userGames = useQuery(
    api.games.getGamesByCreator,
    dbUser?._id ? { creatorId: dbUser._id } : "skip"
  );

  const handleUpvote = async (gameId: any) => {
    if (!currentUser) return;
    try {
      await upvoteGame({ gameId });
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  // Loading state
  if (!dbUser) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-[#111111] rounded-[32px] p-8 animate-pulse h-96" />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#111111] rounded-[32px] p-6 animate-pulse h-64" />
          <div className="bg-[#111111] rounded-[32px] p-6 animate-pulse h-48" />
        </div>
      </div>
    );
  }

  const isCreator = dbUser.role === "creator";
  const isStudio = dbUser.role === "studio";
  const displayTitle = isCreator ? "Personal Portfolio" : "Studio Portfolio";
  const displayAboutLabel = isCreator ? "About Creator" : "About Studio";
  const displayDescTitle = isCreator ? "Personal Details:" : "About studio:";
  const displayDesc = dbUser.bio || "No description yet. Complete your profile to add a bio.";
  const displayLocation = dbUser.location || "Location not set";
  const displayName = dbUser.name || "User";
  
  // Helper to validate image URLs
  const getValidImageUrl = (url: string | undefined, fallback: string): string => {
    if (!url || url.trim() === "" || url === "undefined" || url === "null") return fallback;
    if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return fallback;
  };
  
  const avatarUrl = getValidImageUrl(dbUser.avatar || user?.avatar, "/images/avatar.png");
  const coverImageUrl = dbUser.coverImage && dbUser.coverImage !== "" && dbUser.coverImage !== "undefined" ? dbUser.coverImage : null;
  
  // Map socials from Convex schema
  const socialMapping: { key: keyof NonNullable<typeof dbUser.socials>; label: string }[] = [
    { key: "tiktok", label: "TikTok" },
    { key: "youtube", label: "YouTube" },
    { key: "twitter", label: "X (Twitter)" },
    { key: "instagram", label: "Instagram" },
    { key: "twitch", label: "Twitch" },
  ];
  
  const displaySocials = socialMapping
    .filter(s => dbUser.socials?.[s.key])
    .map(s => ({
      platform: s.label,
      handle: dbUser.socials?.[s.key] || "",
      url: dbUser.socials?.[s.key] || "#"
    }));

  const hasSocials = displaySocials.length > 0;
  const hasGames = userGames && userGames.length > 0;

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
              {[1].map((_, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full bg-[#1A1A1A]">
                     {coverImageUrl ? (
                       <Image 
                          src={coverImageUrl} 
                          alt="Featured" 
                          fill 
                          className="object-cover opacity-80"
                        />
                     ) : (
                       <div className="absolute inset-0 bg-linear-to-br from-[#1A1A1A] via-[#0A0A0A] to-[#1A1A1A]" />
                     )}
                     <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-center">
                           <h3 className="text-white text-2xl font-bold mb-2">Welcome to {displayName}'s Profile</h3>
                           <p className="text-white/40 text-sm">Explore my creations and projects in the portfolio below.</p>
                        </div>
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
              {isCreator ? "Showcase your creative work and projects" : "Showcase your studio's games and projects"}
            </p>
          </div>

          {isStudio ? (
            hasGames ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {userGames.map((game) => (
                    <div key={game._id} className="bg-[#111111] rounded-[24px] p-3 flex flex-col gap-3 group">
                       {/* Card Image */}
                       <Link href={`/games/${game._id}`} className="relative aspect-4/3 rounded-[20px] overflow-hidden bg-[#1A1A1A]">
                          {game.coverImage ? (
                            <Image 
                              src={game.coverImage} 
                              alt={game.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Triangle className="w-12 h-12 text-white/5" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex flex-col items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleUpvote(game._id);
                              }}
                              className={`w-10 h-10 flex flex-col items-center justify-center rounded-xl backdrop-blur-md border transition-all ${
                                currentUser && game.upvotedBy.includes(currentUser._id)
                                  ? "bg-[#8b5cf6] border-[#8b5cf6] text-white"
                                  : "bg-black/40 border-white/10 text-white hover:bg-white/10"
                              }`}
                            >
                              <Triangle className={`w-3 h-3 fill-current mb-0.5 ${currentUser && game.upvotedBy.includes(currentUser._id) ? "rotate-0" : "rotate-0"}`} />
                              <span className="text-[10px] font-bold">{game.upvotes}</span>
                            </button>
                          </div>
                       </Link>
  
                       {/* Card Footer */}
                       <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 relative">
                               <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-white text-xs font-bold">{game.title}</span>
                               <span className="text-white/40 text-[10px]">@{displayName}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                             <Link href={`/games/${game._id}`} className="h-7 px-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[10px] font-bold rounded-full transition-colors flex items-center justify-center">
                               View
                             </Link>
                             {currentUser && game.creatorId === currentUser._id && (
                               <Link href={`/edit-game/${game._id}`} className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-full transition-colors flex items-center justify-center">
                                 Edit
                               </Link>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="bg-[#111111] rounded-[32px] p-20 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-white/5">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white/20" />
                </div>
                <div className="text-center">
                  <h3 className="text-white text-xl font-medium mb-2">No games yet</h3>
                  <p className="text-white/40 text-sm max-w-xs mx-auto mb-8">
                    Your portfolio is currently empty. Start by uploading your first game to showcase it here.
                  </p>
                  <Link 
                    href="/upload-game"
                    className="bg-[#7628db] hover:bg-[#8b3eff] text-white px-10 py-4 rounded-full font-bold transition-all shadow-[0_4px_20px_rgba(118,40,219,0.3)] inline-flex items-center gap-2"
                  >
                    <Upload size={18} />
                    Upload Game
                  </Link>
                </div>
              </div>
            )
          ) : (
            /* Creator Snapshot Portfolio */
            dbUser.snapshots && dbUser.snapshots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {dbUser.snapshots.map((snap, i) => (
                    <div key={i} className="bg-[#111111] rounded-[24px] p-3 flex flex-col gap-3 group aspect-video relative overflow-hidden">
                       <Image 
                          src={snap.url} 
                          alt={snap.title || "Snapshot"} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                           <span className="text-white text-xs font-bold">{snap.title || `Snapshot ${i+1}`}</span>
                        </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="bg-[#111111] rounded-[32px] p-20 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-white/5">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white/20" />
                </div>
                <div className="text-center">
                  <h3 className="text-white text-xl font-medium mb-2">No snapshots yet</h3>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    Your portfolio is currently empty. Go to settings to upload your snapshots.
                  </p>
                </div>
              </div>
            )
          )}
        </div>

      </div>

      {/* --- Right Column (Sidebar) --- */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* About Creator Card */}
        <div className="bg-[#111111] rounded-[32px] p-6 flex flex-col gap-6">
           <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-2">
              <Folder className="w-5 h-5 text-white/80 fill-white/10" />
              <div className="flex-1 flex justify-between items-center">
                <span className="text-white font-medium">{displayAboutLabel}</span>
                <Link href="/settings" className="text-white/20 hover:text-[#7628db] transition-colors">
                  <Edit2 size={14} />
                </Link>
              </div>
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
                  <span className="text-white/60 text-sm">Role:</span>
                  <span className="text-white/40 text-sm text-right capitalize">{dbUser.role}</span>
               </div>
             </>
           )}

           {isStudio && (
             <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Type:</span>
                <span className="text-white/40 text-sm text-right">Game Studio</span>
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
                <Link href="/settings" className="text-white/20 hover:text-[#7628db] transition-colors">
                  <Edit2 size={14} />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <span className="text-white text-sm">Resumé / CV</span>
               <button className="bg-[#2a2a2a] hover:bg-[#333] text-[#4ade80] text-xs px-4 py-1.5 rounded-full transition-colors">
                 {displayName}
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
              <div className="flex-1 flex justify-between items-center">
                <span className="text-white font-medium">Social Links</span>
                <Link href="/settings" className="text-white/20 hover:text-[#7628db] transition-colors">
                  <Edit2 size={14} />
                </Link>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              {hasSocials ? (
                displaySocials.map((social) => (
                   <div key={social.platform} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <span className="text-white text-sm">{social.platform}:</span>
                      <a 
                        href={social.url.startsWith('http') ? social.url : `https://${social.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#2a2a2a] hover:bg-[#333] text-[#4ade80] text-xs px-4 py-1.5 rounded-full transition-colors"
                      >
                        {social.handle.replace(/https?:\/\/(www\.)?/, '').split('/')[0] || social.handle}
                      </a>
                   </div>
                ))
              ) : (
                <p className="text-white/40 text-sm">No social links added yet.</p>
              )}
           </div>
        </div>

      </div>

    </div>
  );
}
