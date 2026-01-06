"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Plus, ExternalLink, Loader2, MessageSquare } from "lucide-react"; // Replaced Triangle with Plus for Follow
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Container from "@/components/ui/Container";
import { useAuth } from "@/components/providers/AuthProvider";

// Helper to get valid image URL
const getImageUrl = (url?: string) => {
  if (url && (url.startsWith("http") || url.startsWith("/"))) return url;
  return "/images/avatar.png"; // Fallback for profile
};

export default function UserProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const profileId = params.id as Id<"users">; // Get ID from URL
  
  // Fetch profile user
  const profileUser = useQuery(api.users.getUser, profileId ? { id: profileId } : "skip");
  const currentUser = useQuery(api.users.getUserByEmail, user?.email ? { email: user.email } : "skip");
  
  // Fetch games by this creator/studio
  const userGames = useQuery(api.games.getGamesByCreator, profileId ? { creatorId: profileId } : "skip") || [];

  // Follow Logic
  const toggleFollow = useMutation(api.users.toggleFollow);
  const isFollowing = useQuery(api.users.isFollowing, (user && profileUser?._id) ? { followerId: user.id as Id<"users">, followingId: profileUser._id } : "skip");

  const handleFollow = async () => {
    if (!isAuthenticated || !user || !profileUser) {
        toast.error("Please login to follow.");
        return;
    }
    
    try {
        await toggleFollow({ followerId: user.id as Id<"users">, followingId: profileUser._id });
    } catch (err) {
        console.error("Follow error:", err);
        toast.error("Failed to follow.");
    }
  };

  if (profileUser === undefined) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    );
  }

  if (profileUser === null) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-preahvihear text-white mb-4">User not found</h1>
        <p className="text-white/60 mb-8 font-dm-sans">This profile does not exist.</p>
        <Link href="/" className="bg-[#7628db] text-white px-6 py-3 rounded-full font-dm-sans">
          Go Home
        </Link>
      </main>
    );
  }

  const isOwnProfile = currentUser?._id === profileUser._id;

  return (
    <main className="min-h-screen bg-background text-foreground">

      <Container className="pt-24 pb-20">
        {/* Profile Header (Mimics Game Header Style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-linear-to-r from-[#7628db] to-[#40A261] rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative overflow-hidden"
        >
          {/* Background decoration or cover image could go here if available */}
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 z-10 w-full">
             <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/20 overflow-hidden bg-black/50 shrink-0">
                <Image 
                   src={getImageUrl(profileUser.avatar)}
                   alt={profileUser.name || "User"}
                   fill
                   className="object-cover"
                />
             </div>
             <div className="text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-preahvihear text-white mb-1 truncate">{profileUser.name}</h1>
                <p className="text-white/80 font-dm-sans text-base md:text-lg capitalize">{profileUser.role || "Creator"}</p>
                {profileUser.location && (
                    <p className="text-white/60 font-dm-sans text-xs md:text-sm flex items-center justify-center sm:justify-start gap-2 mt-1">
                        📍 {profileUser.location}
                    </p>
                )}
                <p className="text-white/80 font-dm-sans text-xs md:text-sm font-medium mt-2">
                    {profileUser.followersCount || 0} {profileUser.followersCount === 1 ? "Follower" : "Followers"}
                </p>
             </div>
          </div>

          {!isOwnProfile && (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                className={`cursor-pointer px-6 py-3 rounded-full font-dm-sans font-semibold flex items-center gap-2 transition-colors z-10 ${isFollowing ? 'bg-[#7628DB] text-white hover:bg-[#6020A0]' : 'backdrop-blur-sm bg-[#111]/50 hover:bg-[#111]/70 text-white'}`}
              >
                {isFollowing ? (
                    <>Following</>
                ) : (
                    <>
                        <Plus size={18} />
                        Follow
                    </>
                )}
              </motion.button>
              <Link href={`/messages?userId=${profileId}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer px-6 py-3 rounded-full font-dm-sans font-semibold flex items-center gap-2 transition-colors z-10 backdrop-blur-sm bg-[#111]/50 hover:bg-[#111]/70 text-white border border-white/10"
                  >
                    <MessageSquare size={18} />
                    Message
                  </motion.button>
              </Link>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Left Column: Games/Portfolio */}
          <div className="flex flex-col gap-8">
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-8 min-h-[400px]">
              <h2 className="text-2xl font-preahvihear text-white mb-6">Portfolio</h2>
              
              {userGames.length === 0 ? (
                  <div className="text-white/40 text-center py-20 font-dm-sans">
                      No games published yet.
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userGames.map((game) => (
                          <Link href={`/games/${game._id}`} key={game._id} className="group block">
                              <div className="relative aspect-video rounded-[24px] overflow-hidden border border-white/10 mb-3">
                                  <Image 
                                      src={getImageUrl(game.coverImage)}
                                      alt={game.title}
                                      fill
                                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                              </div>
                              <h3 className="text-lg font-bold text-white group-hover:text-[#7628db] transition-colors">{game.title}</h3>
                              <p className="text-sm text-white/50 truncate">{game.tagline}</p>
                          </Link>
                      ))}
                  </div>
              )}
            </div>
          </div>

          {/* Right Column: About/Info */}
          <div className="flex flex-col gap-8">
            {/* About Card */}
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-linear-to-br from-[#7628db] to-[#40A261]" />
                <h3 className="text-lg font-dm-sans font-semibold text-white">About</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-white mb-2">Bio:</h4>
                  <p className="text-sm text-white/40 font-dm-sans leading-relaxed whitespace-pre-wrap">
                      {profileUser.bio || "No bio provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-linear-to-br from-[#7628db] to-[#40A261]" />
                <h3 className="text-lg font-dm-sans font-semibold text-white">Social Links</h3>
              </div>

              <div className="space-y-4">
                {profileUser.socials && Object.keys(profileUser.socials).length > 0 ? (
                  Object.entries(profileUser.socials).map(([platform, handle]) => (
                    handle ? (
                      <div key={platform} className="flex justify-between items-center">
                        <span className="text-sm text-white font-dm-sans capitalize">{platform}:</span>
                        <a
                          href={handle.startsWith("http") ? handle : `https://${platform}.com/${handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#26AB4C]/20 text-[#26AB4C] px-4 py-1.5 rounded-full text-sm font-dm-sans font-medium hover:bg-[#26AB4C]/30 transition-colors flex items-center gap-1"
                        >
                          View
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ) : null
                  ))
                ) : (
                  <p className="text-white/40 text-sm italic">No social links added.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
