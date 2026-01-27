"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Triangle, ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import Container from "@/components/ui/Container";
import { useAuth } from "@/components/providers/AuthProvider";

// Helper to get valid image URL
const getImageUrl = (url?: string) => {
  if (url && (url.startsWith("http") || url.startsWith("/"))) return url;
  return "/images/onboarding/sideimageman.jpg"; // Fallback
};

// Helper to parse YouTube URL
const getEmbedUrl = (url: string) => {
  try {
    if (url.includes("embed/")) return url;
    
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  } catch (e) {
    return url;
  }
};

const FeaturedCarousel = ({ game }: { game: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Construct slides array: Trailer (if exists) + Snapshots
  const slides = [
    ...(game.trailerUrl ? [{ type: 'trailer', content: game.trailerUrl }] : []),
    ...(game.snapshots?.map((url: string) => ({ type: 'image', content: url })) || [])
  ];

  if (slides.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
        <span className="text-white/20 font-dm-sans">No featured content available</span>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-full group">
      {/* Content */}
      <div className="w-full h-full">
          {slides[currentIndex].type === 'trailer' ? (
            <iframe 
              src={getEmbedUrl(slides[currentIndex].content)} 
              className="w-full h-full" 
              allowFullScreen 
              title="Game Trailer"
            />
          ) : (
            <div className="relative w-full h-full">
               <Image 
                  src={slides[currentIndex].content} 
                  alt={`Snapshot ${currentIndex}`} 
                  fill 
                  className="object-cover" 
               />
            </div>
          )}
      </div>

      {/* Navigation Arrows (Only if > 1 slide) */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#7628db] transition-colors z-10 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#7628db] transition-colors z-10 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-[#7628db] w-6" : "bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function GameProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const gameId = params.id as Id<"games">;
  
  const game = useQuery(api.games.getGame, gameId ? { id: gameId } : "skip");
  const currentUser = useQuery(api.users.getUserByEmail, user?.email ? { email: user.email } : "skip");
  const upvoteGame = useMutation(api.games.upvoteGame);

  const handleUpvote = async () => {
    if (!currentUser) return;
    try {
      await upvoteGame({ gameId });
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  if (game === undefined) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    );
  }

  if (game === null) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-preahvihear text-white mb-4">Game not found</h1>
        <p className="text-white/60 mb-8 font-dm-sans">This game does not exist or has been removed.</p>
        <Link href="/" className="bg-[#7628db] text-white px-6 py-3 rounded-full font-dm-sans">
          Go Home
        </Link>
      </main>
    );
  }

  const isUpvoted = currentUser && game.upvotedBy?.includes(currentUser._id);

  return (
    <main className="min-h-screen bg-background text-foreground pt-32">

      <Container className="pt-24 pb-20">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-linear-to-r from-[#5F26A7] to-[#187236] rounded-[16px] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-power text-white mb-2">{game.title}</h1>
            <p className="text-white/60 font-dm-sans">{game.tagline || "No tagline"}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpvote}
            className={`cursor-pointer px-6 py-3 rounded-full font-dm-sans font-semibold flex items-center gap-2 transition-colors backdrop-blur-sm ${
              isUpvoted 
                ? "bg-white text-[#7628db]" 
                : "bg-[#111]/50 hover:bg-[#111]/70 text-white"
            }`}
          >
            <Triangle size={14} className={`fill-current ${isUpvoted ? "" : "opacity-80"}`} />
            Upvote • {game.upvotes}
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            {/* Cover Image */}
            <div className="relative aspect-video rounded-[32px] overflow-hidden group border border-white/5">
              <Image
                src={getImageUrl(game.coverImage)}
                alt={game.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Featured Section / Snapshots or Trailer */}
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-8">
              <h2 className="text-2xl font-power text-white text-center mb-6">Featured</h2>
              
              <div className="w-full aspect-video rounded-[24px] overflow-hidden bg-black relative group">
                  <FeaturedCarousel game={game} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* About Game Card */}
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-linear-to-br from-[#7628db] to-[#40A261]" />
                <h3 className="text-lg font-power font-semibold text-white">About Game</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-white mb-2">Description:</h4>
                  <p className="text-sm text-white/40 font-dm-sans leading-relaxed whitespace-pre-wrap">{game.description || "No description provided."}</p>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-sm text-white font-dm-sans">Location:</span>
                  <span className="text-sm text-white/60 font-dm-sans">{game.location || "Not specified"}</span>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-sm text-white font-dm-sans">Studio/Creator:</span>
                  {game.studio ? (
                     <Link href={`/studio/${game.studio._id}`} className="text-sm text-white/60 font-dm-sans underline hover:text-white transition-colors">
                       {game.studio.name}
                     </Link>
                  ) : game.creator ? (
                     <Link href={`/creators/${game.creator._id}`} className="text-sm text-white/60 font-dm-sans underline hover:text-white transition-colors">
                       {game.creator.name}
                     </Link>
                  ) : (
                    <span className="text-sm text-white/60 font-dm-sans">Unknown</span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-linear-to-br from-[#7628db] to-[#40A261]" />
                <h3 className="text-lg font-power font-semibold text-white">Social Links</h3>
              </div>

              <div className="space-y-4">
                {game.socials && Object.keys(game.socials).length > 0 ? (
                  Object.entries(game.socials).map(([platform, handle]) => (
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
