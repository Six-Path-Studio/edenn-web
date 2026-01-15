"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Plus, ExternalLink, Loader2, MessageSquare, Triangle, Check } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Container from "@/components/ui/Container";
import { useAuth } from "@/components/providers/AuthProvider";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// Helper to get valid image URL
const getImageUrl = (url?: string) => {
  if (url && (url.startsWith("http") || url.startsWith("/"))) return url;
  return "/images/avatar.png"; // Fallback for profile
};

export default function CreatorPublicProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const profileId = params.id as Id<"users">; // Get ID from URL
  
  // State for modals
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [showUnupvoteModal, setShowUnupvoteModal] = useState(false);

  // Fetch profile user
  const profileUser = useQuery(api.users.getUser, profileId ? { id: profileId } : "skip");
  const currentUser = useQuery(api.users.getUserByEmail, user?.email ? { email: user.email } : "skip");
  
  // Fetch games by this creator/studio
  const userGames = useQuery(api.games.getGamesByCreator, profileId ? { creatorId: profileId } : "skip") || [];

  // Follow Logic
  const toggleFollow = useMutation(api.users.toggleFollow);
  const isFollowing = useQuery(api.users.isFollowing, (user && profileUser?._id) ? { followerId: user.id as Id<"users">, followingId: profileUser._id } : "skip");

  // Upvote Logic
  const toggleProfileUpvote = useMutation(api.users.toggleUpvoteProfile);
  const isUpvoted = user && profileUser?.upvotedBy?.includes(user!.id as Id<"users">);

  const handleFollowClick = () => {
    if (!isAuthenticated || !user || !profileUser) {
        toast.error("Please login to follow.");
        return;
    }
    
    if (isFollowing) {
        setShowUnfollowModal(true);
    } else {
        performFollow();
    }
  };

  const performFollow = async () => {
    try {
        await toggleFollow({ followerId: user!.id as Id<"users">, followingId: profileUser!._id });
        setShowUnfollowModal(false);
        toast.success(isFollowing ? "Unfollowed" : "Followed");
    } catch (err) {
        console.error("Follow error:", err);
        toast.error("Failed to update follow status.");
    }
  };

  const handleUpvoteClick = async () => {
      if (!isAuthenticated || !user) return toast.error("Please login to upvote");
      
      // If already upvoted, show modal to un-upvote
      if (isUpvoted) {
          setShowUnupvoteModal(true);
      } else {
          try {
             await toggleProfileUpvote({ userId: user.id as Id<"users">, targetId: profileUser!._id });
             toast.success("Upvoted!");
          } catch(err) {
             console.error("Upvote error", err);
             toast.error("Failed to upvote");
          }
      }
  };

  const performUnUpvote = async () => {
      if (!user || !profileUser) return;
      try {
          await toggleProfileUpvote({ userId: user.id as Id<"users">, targetId: profileUser._id });
          toast.success("Removed upvote");
          setShowUnupvoteModal(false);
      } catch(err) {
          console.error("Un-upvote error", err);
          toast.error("Failed to remove upvote");
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
        <h1 className="text-3xl font-preahvihear text-white mb-4">Creator not found</h1>
        <p className="text-white/60 mb-8 font-dm-sans">This profile does not exist.</p>
        <Link href="/" className="bg-[#7628db] text-white px-6 py-3 rounded-full font-dm-sans">
          Go Home
        </Link>
      </main>
    );
  }

  const isOwnProfile = currentUser?._id === profileUser._id;
  const isStudio = profileUser.role === 'studio';

  // Featured Content Logic: Youtube > Snapshot > Default
  const youtubeLink = profileUser.socials?.youtube;
  const hasYoutube = youtubeLink && youtubeLink.length > 0;
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showUnfollowModal}
        onClose={() => setShowUnfollowModal(false)}
        onConfirm={performFollow}
        title={`Unfollow ${profileUser.name}?`}
        description="Are you sure you want to stop following? You won’t see their updates anymore."
        confirmText="Unfollow"
        cancelText="Cancel"
      />
       <ConfirmationModal
        isOpen={showUnupvoteModal}
        onClose={() => setShowUnupvoteModal(false)}
        onConfirm={performUnUpvote}
        title="Remove Upvote?"
        description="Are you sure you want to remove your upvote? This will decrease their reputation score."
        confirmText="Remove Upvote"
      />

      <Container className="pt-24 pb-20">
        
        {/* HERO SECTION / PROFILE HEADER */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full relative rounded-[32px] overflow-hidden mb-8 min-h-[350px] flex flex-col justify-end group"
        >
             {/* Background Image */}
             <div className="absolute inset-0 z-0">
                <Image 
                    src={profileUser.coverImage || "/images/Splash Loading Screen.jpg"}
                    alt="Cover"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-black/40 to-transparent" />
             </div>

             <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex items-end gap-6 translate-y-8 md:translate-y-12">
                    {/* Profile Image */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-[#0a0a0a] overflow-hidden bg-[#111] shrink-0 shadow-2xl">
                        <Image 
                            src={profileUser.avatar || "/images/Group 34374.png"} 
                            alt={profileUser.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="mb-4 pb-2">
                        <h1 className="text-4xl md:text-5xl font-preahvihear text-white mb-1 drop-shadow-lg">{profileUser.name}</h1>
                        <p className="text-white/80 font-dm-sans text-lg drop-shadow-md capitalize">{profileUser.role || 'Creator'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-2 md:p-3 border border-white/5 flex gap-4">
                        <div className="text-center px-2">
                            <span className="block text-xl font-bold text-white font-dm-sans">{(profileUser.upvotes || 0)}</span>
                            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Rep</span>
                        </div>
                         <div className="w-px bg-white/10" />
                         <div className="text-center px-2">
                            <span className="block text-xl font-bold text-white font-dm-sans">{profileUser.locationFlag || "🌍"}</span>
                            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Loc</span>
                        </div>
                         <div className="w-px bg-white/10" />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUpvoteClick}
                            className={`flex flex-col items-center justify-center px-2 min-w-[60px] cursor-pointer ${isUpvoted ? 'text-[#7628DB]' : 'text-white/80 hover:text-white'}`}
                        >
                             <Triangle size={20} className={`fill-current mb-0.5 ${isUpvoted ? 'rotate-0 text-[#7628DB]' : ''}`} />
                             <span className="text-xs uppercase tracking-wider font-semibold">{isUpvoted ? 'Upvoted' : 'Upvote'}</span>
                        </motion.button>
                    </div>
                    
                    {!isOwnProfile && (
                        <Link href={`/messages?userId=${profileUser._id}`}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="h-full aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/5 text-white transition-colors"
                            >
                                <MessageSquare size={20} />
                            </motion.button>
                        </Link>
                    )}
                </div>
             </div>
        </motion.div>

        {/* TOP CONTENT GRID (Featured + Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 mb-16 mt-16">
          
          {/* LEFT COLUMN: FEATURED */}
          <div className="flex flex-col gap-8">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-preahvihear text-white">Featured</h2>
             </div>
             
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="bg-[#111] border border-white/5 rounded-[32px] p-1 overflow-hidden"
             >
                {/* Featured Content Logic: Youtube Embed or Snapshot */}
                <div className="bg-[#1a1a1a] rounded-[30px] aspect-video w-full overflow-hidden relative flex items-center justify-center group">
                    {hasYoutube ? (
                       <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${youtubeLink}`} 
                            className="w-full h-full"
                            title="Featured Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                       />
                    ) : (
                       <div className="relative w-full h-full">
                           <Image 
                               src="/images/Splash Loading Screen.jpg"
                               alt="Featured Snapshot"
                               fill
                               className="object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80"
                           />
                            <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-black/20 via-black/50 to-black/80" />
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                               <h3 className="text-2xl font-preahvihear text-white mb-2">My Latest Work</h3>
                               <p className="text-white/40 font-dm-sans max-w-sm">No video featured yet. Check out the portfolio below.</p>
                           </div>
                       </div>
                    )}
                </div>
             </motion.div>
          </div>

          {/* RIGHT COLUMN: ABOUT & SOCIALS */}
          <div className="flex flex-col gap-6">
            
            <h2 className="text-lg font-dm-sans font-medium text-white/50 flex items-center gap-2">
                 <Image src="/images/Mask group.png" width={20} height={20} alt="icon" className="opacity-70" />
                 About {isStudio ? 'Studio' : 'Creator'}
            </h2>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-[#111] border border-white/5 rounded-[32px] p-6 relative overflow-hidden flex-1 min-h-[200px]"
            >
               <div className="absolute inset-0 z-0 opacity-10">
                    <Image
                        src="/images/Screenshot 2025-06-13 184845 1.png"
                        alt="Background"
                        fill
                        className="object-cover"
                    />
                     <div className="absolute inset-0 bg-linear-to-b from-[#111]/80 to-[#111]" />
               </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="space-y-6 flex-1">
                    <div>
                        <h4 className="text-sm text-white/50 mb-2 uppercase tracking-wider font-semibold text-[10px]">Personal Details</h4>
                        <p className="text-sm text-white/80 font-dm-sans leading-relaxed line-clamp-6">
                            {profileUser.bio || "Assuming the role of a creator in the Edenn ecosystem implies a commitment to innovation."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <h4 className="text-xs text-white/40 mb-1 uppercase tracking-wider font-semibold">Location</h4>
                             <p className="text-white font-dm-sans text-sm">{profileUser.location || "Lagos, Nigeria"}</p>
                        </div>
                        <div>
                             <h4 className="text-xs text-white/40 mb-1 uppercase tracking-wider font-semibold">Website</h4>
                             <Link href={profileUser.socials?.portfolio || "#"} className="text-[#A86CF5] font-dm-sans text-sm hover:underline truncate block">
                                 {profileUser.socials?.portfolio ? 'View Portfolio' : 'edenn.com'}
                             </Link>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>

            {/* Social Links Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-[#111] border border-white/5 rounded-[32px] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-linear-to-br from-[#7628db] to-[#40A261]" />
                    <h3 className="text-lg font-dm-sans font-semibold text-white">Social Links</h3>
                </div>
              </div>

              <div className="space-y-3">
                {profileUser.socials && Object.keys(profileUser.socials).length > 0 ? (
                  Object.entries(profileUser.socials).map(([platform, handle]) => (
                    handle ? (
                      <div key={platform} className="flex justify-between items-center group bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                        <span className="text-sm text-white font-dm-sans capitalize">{platform}</span>
                        <a
                          href={handle.startsWith("http") ? handle : `https://${platform}.com/${handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#26AB4C]/20 text-[#26AB4C] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-[#26AB4C] hover:text-white transition-all"
                        >
                          {handle.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].slice(0, 10)}
                        </a>
                      </div>
                    ) : null
                  ))
                ) : (
                  [ 'Tiktok', 'Youtube', 'X (Twitter)', 'Instagram', 'Twitch' ].map((p) => (
                       <div key={p} className="flex justify-between items-center group bg-white/5 rounded-xl px-4 py-3 opacity-50">
                        <span className="text-sm text-white font-dm-sans capitalize">{p}</span>
                         <span className="bg-white/10 text-white/40 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Empty</span>
                      </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM SECTION: PORTFOLIO / SNAPSHOTS */}
        <div className="mt-20">
            <div className="flex flex-col items-center justify-center mb-12">
                <h2 className="text-3xl md:text-5xl font-preahvihear text-white text-center mb-4">
                    {isStudio ? 'Studio Portfolio' : 'Personal Portfolio'}
                </h2>
                <p className="text-white/40 text-center font-dm-sans max-w-xl mx-auto">
                    Skip the hassle of building from scratch. Get a fully functional AI agent asap.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* SHOW GAMES IF ANY */}
                {userGames.map((game) => (
                        <Link href={`/games/${game._id}`} key={game._id} className="group block relative aspect-video rounded-[24px] overflow-hidden border border-white/10">
                            <Image 
                            src={getImageUrl(game.coverImage)} 
                            alt={game.title} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black via-black/80 to-transparent flex items-end justify-between">
                                <div>
                                    <h3 className="text-white font-bold text-lg font-dm-sans">{game.title}</h3>
                                    <p className="text-white/50 text-xs">{profileUser.name}</p>
                                </div>
                                <div className="bg-[#7628DB] text-white text-xs px-3 py-1 rounded-full font-bold uppercase">View</div>
                            </div>
                        </Link>
                ))}

                {/* SHOW SNAPSHOTS */}
                {(profileUser.snapshots && profileUser.snapshots.length > 0) ? (
                    profileUser.snapshots.map((snap, i) => (
                        <div key={i} className="group block relative aspect-video rounded-[24px] overflow-hidden border border-white/10">
                                <Image 
                                src={getImageUrl(snap.url)} 
                                alt={snap.title || "Snapshot"} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black via-black/80 to-transparent">
                                    <h3 className="text-white font-bold font-dm-sans">{snap.title || `Snapshot ${i+1}`}</h3>
                                </div>
                        </div>
                    ))
                ) : (
                    // Mock Snapshots if none match - User wants to see this section filled
                    userGames.length === 0 && [1, 2, 3, 4, 5, 6].map((_, i) => (
                    <div key={i} className="group relative aspect-video rounded-[24px] overflow-hidden border border-white/10 bg-[#111]">
                        <Image 
                            src={`/images/Splash Loading Screen.jpg`} 
                            alt={`Snapshot ${i}`}
                            fill
                            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-black/50 overflow-hidden relative border border-white/20">
                                    <Image src={profileUser.avatar || "/images/Group 34374.png"} fill alt="User" className="object-cover" />
                            </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black to-transparent flex justify-between items-center">
                                <div>
                                <p className="text-white font-bold text-sm">Portfolio Piece {i+1}</p>
                                <p className="text-white/40 text-[10px] uppercase tracking-wider">{profileUser.name}</p>
                                </div>
                                <button className="bg-[#7628DB] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase hover:bg-[#6020A0]">Link</button>
                        </div>
                    </div>
                    ))
                )}
            </div>
        </div>

      </Container>
    </main>
  );
}
