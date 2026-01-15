"use client";

import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { GameCard } from "@/components/directory/GameCard";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function GamesPage() {
  const games = useQuery(api.games.getTopGames, { limit: 50 });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 60,
        damping: 15,
        mass: 1
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-24">
      
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <DirectoryHeader 
          title="Video Games" 
          description="Connect with world-class game development studios, indie creators, and gaming professionals. Find services, hire talent, or showcase your portfolio."
        />
        
        <DirectoryFilters />
        
        {!games ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center p-20 bg-[#111] rounded-[32px] border border-white/5">
            <p className="text-white/40">No games found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {games.map((game, i) => (
               <motion.div 
                 key={game._id} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 0.5, delay: i % 3 * 0.1 }}
                 whileHover={{ y: -5, transition: { duration: 0.3, ease: "easeOut" } }}
                 className="h-full"
               >
                 <GameCard 
                    id={game._id}
                    title={game.title} 
                    studio={game.tagline || ""} 
                    image={game.coverImage || "/images/unbroken_art.png"} 
                  />
               </motion.div>
             ))}
          </div>
        )}
      </div>
    </main>
  );
}
