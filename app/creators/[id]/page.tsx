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
        <div className="w-full relative mb-12">
            {/* Banner Image Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full aspect-21/9 sm:aspect-21/7 rounded-[32px] overflow-hidden bg-[#1A1A1A] group"
            >
                {profileUser.coverImage ? (
                    <Image 
                        src={profileUser.coverImage}
                        alt="Cover"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-[#1A1A1A] via-[#0A0A0A] to-[#1A1A1A]" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </motion.div>

            {/* Profile Info Section */}
            <div className="relative px-6 sm:px-10 -mt-[75px] sm:-mt-[100px] flex flex-col lg:flex-row items-start lg:items-end gap-6 z-10">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full p-1.5 bg-[#121212]">
                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                            <Image 
                                src={profileUser.avatar || "/images/avatar.png"} 
                                alt={profileUser.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Info Content */}
                <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row items-end sm:items-end justify-between gap-6 pb-2">
                    {/* Name & Desc */}
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#A855F7] tracking-tight">
                            {profileUser.name}
                        </h1>
                        <p className="text-white/60 text-sm sm:text-base font-light capitalize">
                            {profileUser.role || 'Creator'}
                        </p>
                        <p className="text-white/80 text-sm font-medium pt-1">
                            {profileUser.followersCount || 0} {profileUser.followersCount === 1 ? "Follower" : "Followers"}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Upvote */}
                        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleUpvoteClick}>
                            <button className={`w-12 h-12 flex items-center justify-center rounded-2xl border border-white/5 transition-colors ${isUpvoted ? 'bg-[#7628DB] text-white' : 'bg-[#1A1A1A] text-white group-hover:bg-[#252525]'}`}>
                                <span className="font-bold text-lg">{profileUser.upvotes || 0}</span>
                            </button>
                            <div className={`flex items-center gap-1 text-[10px] uppercase tracking-wider ${isUpvoted ? 'text-[#7628DB]' : 'text-[#A855F7]'}`}>
                                <Triangle className={`w-2 h-2 fill-current ${isUpvoted ? 'rotate-0' : 'rotate-180'}`} />
                                <span>{isUpvoted ? 'Upvoted' : 'Upvote'}</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col items-center gap-1 group">
                            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 group-hover:bg-[#252525] transition-colors overflow-hidden">
                                {profileUser.locationFlag ? (
                                    <span className="text-2xl">{profileUser.locationFlag}</span>
                                ) : (
                                    <span className="text-2xl">🌍</span>
                                )}
                            </button>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">
                                {profileUser.location?.split(',')[0] || "Location"}
                            </div>
                        </div>

                        {/* Gift Token */}
                        <div className="flex flex-col items-center gap-1 group cursor-pointer">
                            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#6366f1] group-hover:bg-[#252525] transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                                </svg>
                            </button>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">Gift Token</div>
                        </div>

                        {/* Message */}
                        {!isOwnProfile && (
                            <Link href={`/messages?userId=${profileUser._id}`} className="flex flex-col items-center gap-1 group cursor-pointer">
                                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/5 text-white group-hover:bg-[#252525] transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </button>
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Message</div>
                            </Link>
                        )}

                        {/* Follow Button */}
                        {!isOwnProfile && (
                            <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleFollowClick}>
                                <button className={`w-12 h-12 flex items-center justify-center rounded-2xl border border-white/5 transition-colors ${isFollowing ? 'bg-[#7628DB] text-white' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                                    {isFollowing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </button>
                                <div className={`text-[10px] uppercase tracking-wider ${isFollowing ? 'text-[#7628DB]' : 'text-white/40'}`}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

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
               <div className="absolute inset-0 z-0 bg-linear-to-br from-purple-500/5 via-transparent to-transparent" />

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
                    userGames.length === 0 && (
                        <div className="col-span-full py-20 bg-[#111] rounded-[32px] border border-white/5 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Triangle className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-white font-medium text-lg mb-1">Portfolio coming soon</h3>
                            <p className="text-white/40 text-sm">Stay tuned for amazing work from this {isStudio ? 'Studio' : 'Creator'}.</p>
                        </div>
                    )
                )}
            </div>
        </div>

      </Container>
    </main>
  );
}
