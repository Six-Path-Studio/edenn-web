"use client";

import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { Search, MapPin, LayoutGrid, Triangle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CreatorSidebarCard } from "@/components/directory/CreatorSidebarCard";
import { useState, useMemo } from "react";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link"; // Added Link import

export default function CreatorsPage() {
  const creatorsRaw = useQuery(api.users.getCreators);
  const [searchQuery, setSearchQuery] = useState("");
  const isLoading = creatorsRaw === undefined;

  const creators = useMemo(() => {
    const allCreators = creatorsRaw || [];

    if (!searchQuery.trim()) {
      return allCreators;
    }

    const query = searchQuery.toLowerCase();
    return allCreators.filter(creator =>
      creator.name?.toLowerCase().includes(query) ||
      creator.email?.toLowerCase().includes(query) ||
      creator.bio?.toLowerCase().includes(query) ||
      creator.location?.toLowerCase().includes(query)
    );
  }, [creatorsRaw, searchQuery]);

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
    hidden: { opacity: 0, x: -10 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
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
    <main className="min-h-screen bg-black text-white text-balance pt-32">

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center gap-6 mb-8 pt-24 px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-power text-white tracking-tight">Creators/ Talents</h1>
          <p className="text-white/60 max-w-2xl text-sm md:text-base font-preahvihear font-light leading-relaxed">
            A dedicated ecosystem for digital talents and techies. Showcase your projects to a global audience, and collaborate with peers.
          </p>
          <div className="w-full max-w-2xl bg-[#111111] border border-[#222222] rounded-[24px] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 group focus-within:border-[#7628DB]/30 transition-all">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="bg-transparent px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-[12px] flex items-center justify-center shadow-sm">
                  <Triangle className="w-5 h-5 text-[#4ade80] fill-[#4ade80]" />
                </div>
                <span className="text-white font-bold text-xl font-power tracking-tight">Browse creators</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-xs font-bold whitespace-nowrap">
                  <MapPin className="w-4 h-4 text-[#eab308]" />
                  Location
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-xs font-bold whitespace-nowrap">
                  <LayoutGrid className="w-4 h-4 text-[#f87171]" />
                  Genre
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] transition-colors text-white/80 text-xs font-bold whitespace-nowrap">
                  <Triangle className="w-4 h-4 fill-[#4ade80] text-[#4ade80]" />
                  Upvote
                </motion.button>
              </div>
            </div>

            <div className="bg-transparent rounded-[32px] flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-[#1A1A1A] rounded-[24px] h-[100px] w-full animate-pulse border border-[#333]"
                    />
                  ))
                ) : (creators || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#0B0B0B] rounded-[24px] border border-[#222]">
                    <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-white/20" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-white font-medium text-lg">No Creators Found</h3>
                      <p className="text-white/40 text-sm">Be the first to join or check back later.</p>
                    </div>
                  </div>
                ) : (
                  creators.map((c, i) => (
                    <Link href={`/creators/${c._id}`} key={c._id} className="block w-full">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 0.5, delay: i % 10 * 0.05 }}
                        whileHover={{ x: 6, backgroundColor: "#141414", borderColor: "#7628DB", transition: { duration: 0.2 } }}
                        className="bg-[#0B0B0B] rounded-[24px] p-5 flex items-center justify-between border border-[#222] transition-all group cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-5 min-w-0 flex-1">
                          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center overflow-hidden shrink-0 border border-[#333]">
                            <Image
                              src={c.avatar || "/images/avatar.png"}
                              alt={c.name || "Creator"}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                            <h3 className="text-white font-bold font-power text-lg tracking-tight group-hover:text-[#7628DB] transition-colors truncate">{c.name}</h3>
                            <p className="text-[#888] text-sm truncate">{c.bio || "No bio available"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {c.location && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-[#666] bg-[#1A1A1A] px-3 py-1.5 rounded-full border border-[#222]">
                              <MapPin size={12} /> {c.location}
                            </span>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Add toggle upvote logic here if needed, or just stop nav
                              // For now, assuming user just wants to avoid navigation or needs functional upvote
                              // Since I don't have toggleUpvote imported here, I'll just stop propagation or add basic toast
                              // But better to implement it later fully. For now, stopping nav is key.
                            }}
                            className="bg-[#1A1A1A] w-10 h-10 rounded-full border border-[#222] flex items-center justify-center group-hover:border-[#7628DB] group-hover:text-[#7628DB] transition-all z-20 relative"
                          >
                            <div className="w-5 h-5 flex items-center justify-center">
                              <Triangle className="w-4 h-4 text-white/20 fill-white/20 group-hover:text-[#7628DB] group-hover:fill-[#7628DB] rotate-90" />
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>
                    </Link>
                  )))}
              </div>
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
                <span className="text-white font-bold text-xl font-power tracking-tight">Best Upvote</span>
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
                initial="show"
                animate="show"
                className="flex flex-col gap-3"
              >
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-[60px] bg-[#1A1A1A] rounded-[16px] w-full animate-pulse border border-[#333]" />
                    <div className="h-[60px] bg-[#1A1A1A] rounded-[16px] w-full animate-pulse border border-[#333]" />
                    <div className="h-[60px] bg-[#1A1A1A] rounded-[16px] w-full animate-pulse border border-[#333]" />
                  </div>
                ) : (creators || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-white/20">
                    <p className="text-sm">No featured creators yet.</p>
                  </div>
                ) : (
                  creators.slice(0, 8).map((c, i) => (
                    <motion.div key={i} variants={sidebarItem}>
                      <CreatorSidebarCard
                        name={c.name}
                        tags={c.tags}
                        upvotes={c.upvotes || 0}
                      />
                    </motion.div>
                  )))}
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
