"use client";

import { toast } from "sonner";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { Plus, Triangle, Search } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Id } from "@/convex/_generated/dataModel";

export default function StudiosPage() {
  const { user } = useAuth();
  const studiosRaw = useQuery(api.users.getStudios);
  const [searchQuery, setSearchQuery] = useState("");
  const isLoading = studiosRaw === undefined;

  const studios = useMemo(() => {
    const allStudios = studiosRaw || [];

    if (!searchQuery.trim()) {
      return allStudios;
    }

    const query = searchQuery.toLowerCase();
    return allStudios.filter(studio =>
      studio.name?.toLowerCase().includes(query) ||
      studio.email?.toLowerCase().includes(query) ||
      studio.description?.toLowerCase().includes(query)
    );
  }, [studiosRaw, searchQuery]);
  const toggleFollow = useMutation(api.users.toggleFollow);
  const toggleUpvote = useMutation(api.users.toggleUpvoteProfile);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <main className="min-h-screen bg-background text-white pt-32">

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12 pb-24">
        <DirectoryHeader
          title="Organizations & Game Studios"
          description="Discover organizations, brands, and studios driving and pushing underserved markets globally."
        />
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-8 pt-12 px-4">

          <div className="w-full max-w-2xl bg-[#111111] border border-[#222222] rounded-[24px] px-6 py-4 flex items-center gap-3 group focus-within:border-white/20 transition-all">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/40"
            />
            <Search className="w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
          </div>
        </div>
        <div className="mb-12">
          <DirectoryFilters />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="h-[302px] rounded-[31px] bg-[#1A1A1A] border border-[#333] animate-pulse"
              />
            ))
          ) : studios.length === 0 ? (
            <div className="col-span-full py-20 bg-[#0B0B0B] rounded-[32px] border border-[#222] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-white font-medium text-lg mb-1">No Studios Found</h3>
              <p className="text-white/40 text-sm">Be the first to join properly.</p>
            </div>
          ) : (
            studios.map((s, i) => (
              <Link href={`/studio/${s._id}`} key={s._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i % 3 * 0.1 }}
                  className="group relative h-[302px] rounded-[31px] border border-[#262626] bg-[#0B0B0B] p-3 flex flex-col hover:border-[#7628DB]/40 transition-all duration-200"
                >
                  <div className="flex-1 w-full relative rounded-[20px] overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src={s.coverImage || "/images/Hammer Games.png"}
                      alt={s.name || "Studio"}
                      width={200}
                      height={120}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="h-[57px] px-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full relative overflow-hidden shrink-0 border border-[#262626] bg-black">
                        <Image src={s.avatar || "/images/avatar.png"} alt={s.name || "Avatar"} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-white font-mulish font-black text-[17px] leading-none mb-1">{s.name}</h3>
                        <span className="text-[#727272] text-[11px] font-medium leading-none">@{s.name?.toLowerCase().replace(/\s+/g, '')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async (e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!user?.id) return toast.error("Please sign in to upvote.");

                          try {
                            await toggleUpvote({ targetId: s._id });
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className={`h-9 px-3 rounded-full border flex items-center justify-center gap-1.5 transition-all z-10 relative cursor-pointer ${s.upvotedBy?.includes(user?.id as any)
                          ? "bg-[#4ADE80] border-[#4ADE80] text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                          : "border-[#262626] bg-black text-[#888] hover:text-white hover:border-white"
                          }`}
                      >
                        <Triangle className={`w-3 h-3 ${s.upvotedBy?.includes(user?.id as any) ? "fill-black" : "fill-current"}`} />
                        <span className="text-[11px] font-bold">{s.upvotes || 0}</span>
                      </motion.button>

                      {/* Follow Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={async (e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (!user?.id) {
                            toast.error("Please sign in to follow studios.");
                            return;
                          }

                          try {
                            await toggleFollow({
                              followingId: s._id
                            });
                          } catch (err: any) {
                            const errorMessage = err instanceof Error ? err.message : "Unknown error";
                            if (errorMessage.includes("self")) {
                              toast.error("You cannot follow yourself.");
                            }
                          }
                        }}
                        className="w-10 h-10 rounded-full border border-[#7628DB] text-[#7628DB] flex items-center justify-center hover:bg-[#7628DB] hover:text-white transition-all shadow-[0_0_15px_rgba(118,40,219,0.2)] z-10 relative cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
