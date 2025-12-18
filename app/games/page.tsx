"use client";

import Navbar from "@/components/landing/Navbar";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { GameCard } from "@/components/directory/GameCard";
import { motion } from "framer-motion";

export default function GamesPage() {
  const games = [
    { id: 1, title: "Unbroken", studio: "@Raven Illusion Studio", image: "/images/unbroken_art.png" },
    { id: 2, title: "Vodou", studio: "@Juju Games", image: "/images/vodou_art.png" },
    { id: 3, title: "Beyond Service", studio: "@Goondu Interactive", image: "/images/beyond_art.png" },
    { id: 4, title: "Unbroken", studio: "@Raven Illusion Studio", image: "/images/unbroken_art.png" },
    { id: 5, title: "Vodou", studio: "@Juju Games", image: "/images/vodou_art.png" },
    { id: 6, title: "Beyond Service", studio: "@Goondu Interactive", image: "/images/beyond_art.png" },
    { id: 7, title: "Unbroken", studio: "@Raven Illusion Studio", image: "/images/unbroken_art.png" },
    { id: 8, title: "Vodou", studio: "@Juju Games", image: "/images/vodou_art.png" },
    { id: 9, title: "Beyond Service", studio: "@Goondu Interactive", image: "/images/beyond_art.png" },
    { id: 10, title: "Unbroken", studio: "@Raven Illusion Studio", image: "/images/unbroken_art.png" },
    { id: 11, title: "Vodou", studio: "@Juju Games", image: "/images/vodou_art.png" },
    { id: 12, title: "Beyond Service", studio: "@Goondu Interactive", image: "/images/beyond_art.png" },
  ];

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
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar isLoggedIn={true} />
      
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <DirectoryHeader 
          title="Video Games" 
          description="Connect with world-class game development studios, indie creators, and gaming professionals. Find services, hire talent, or showcase your portfolio."
        />
        
        <DirectoryFilters />
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
           {games.map(game => (
             <motion.div 
               key={game.id} 
               variants={item}
               whileHover={{ y: -5, transition: { duration: 0.3, ease: "easeOut" } }}
               className="h-full"
             >
               <GameCard 
                 title={game.title} 
                 studio={game.studio} 
                 image={game.image} 
               />
             </motion.div>
           ))}
        </motion.div>
      </div>
    </main>
  );
}
