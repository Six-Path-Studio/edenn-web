"use client";

import Navbar from "@/components/landing/Navbar";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { Search, MapPin, LayoutGrid, Triangle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CreatorSidebarCard } from "@/components/directory/CreatorSidebarCard";

export default function CreatorsPage() {
  const creators = Array(12).fill({
    name: "Hammer Games",
    tags: ["#Artist", "#Gamedeveloper"],
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -15, scale: 0.98 },
    show: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15
      }
    }
  };

  const sidebarItem = {
    hidden: { opacity: 0, x: 15, scale: 0.98 },
    show: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden text-balance">
      <Navbar isLoggedIn={true} />
      
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center gap-6 mb-8 pt-24 px-4"
        >
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Creators</h1>
            <p className="text-white/60 max-w-2xl text-sm md:text-base font-light leading-relaxed">
            Connect with world-class game development studios, indie creators, and gaming professionals. Find services, hire talent, or showcase your portfolio.
            </p>
             <div className="w-full max-w-2xl bg-[#111111] border border-[#222222] rounded-[24px] px-6 py-4 flex items-center gap-3 group focus-within:border-[#7628DB]/30 transition-all">
              <input 
                type="text" 
                placeholder="Search"
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/40"
              />
              <Search className="w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
            </div>
        </motion.div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
           
           {/* Left: Creator List */}
           <div className="lg:col-span-8">
              {/* List Header */}
              <div className="bg-transparent px-4 flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-sm">
                       <svg className="w-6 h-6 text-[#4ade80]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                       </svg>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Creators</span>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-[#eab308]" />
                      Location
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-sm font-medium">
                      <LayoutGrid className="w-4 h-4 text-[#f87171]" />
                      Genre
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-sm font-medium">
                      <Triangle className="w-4 h-4 fill-[#4ade80] text-[#4ade80]" />
                      Upvote
                    </motion.button>
                 </div>
              </div>

               <div className="bg-[#111111] rounded-[32px] p-6 flex flex-col gap-4 border border-white/5">
                <motion.div 
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.05 }}
                  className="flex flex-col gap-3"
                >
                    {creators.map((c, i) => (
                      <motion.div 
                        key={i} 
                        variants={item}
                        whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)", transition: { duration: 0.2 } }}
                        className="bg-black/20 rounded-[28px] p-4 flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group cursor-pointer"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/5">
                               <Image src="/images/avatar.png" alt="Logo" width={40} height={40} className="object-cover" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                               <h3 className="text-white font-black text-lg tracking-tight group-hover:text-[#7628DB] transition-colors">Hammer Games</h3>
                               <span className="text-[#9CA3AF] text-sm font-medium italic opacity-60">#Artist #Gamedeveloper</span>
                            </div>
                         </div>
                         
                         <motion.button 
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                           className="bg-black/40 p-3 rounded-2xl border border-white/5 hover:border-[#7628DB]/30 transition-all"
                         >
                           <div className="w-7 h-5 flex border border-white/10 rounded-[3px] overflow-hidden">
                             <div className="w-1/3 bg-[#008751] h-full" />
                             <div className="w-1/3 bg-white h-full" />
                             <div className="w-1/3 bg-[#008751] h-full" />
                           </div>
                         </motion.button>
                      </motion.div>
                    ))}
                </motion.div>
               </div>
           </div>

           <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Sidebar Header */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-transparent px-4 flex items-center justify-between mb-0"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-sm">
                       <svg className="w-6 h-6 text-[#4ade80]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                       </svg>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Best Upvote</span>
                 </div>
                 
                 <div className="bg-black/40 p-2 px-3 rounded-lg border border-white/5">
                   <div className="w-5 h-3 flex border border-white/10 rounded-[1px] overflow-hidden shrink-0">
                      <div className="w-1/3 bg-[#008751] h-full" />
                      <div className="w-1/3 bg-white h-full" />
                      <div className="w-1/3 bg-[#008751] h-full" />
                   </div>
                 </div>
              </motion.div>

              <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 min-h-[400px]">
                   <motion.div 
                      variants={container}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.05 }}
                      className="flex flex-col gap-3"
                   >
                      {creators.slice(0, 8).map((c, i) => (
                        <motion.div key={i} variants={sidebarItem}>
                          <CreatorSidebarCard 
                            name={c.name} 
                            tags={c.tags} 
                            upvotes={232} 
                          />
                        </motion.div>
                      ))}
                   </motion.div>
              </div>
           </div>

        </div>
      </div>
    </main>
  );
}
