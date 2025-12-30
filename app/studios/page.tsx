"use client";

import Navbar from "@/components/landing/Navbar";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { Plus } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

import { useQuery, useMutation } from "convex/react"; // Added useMutation
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider"; // Added useAuth
import { Id } from "@/convex/_generated/dataModel";

export default function StudiosPage() {
  const { user } = useAuth();
  const studios = useQuery(api.users.getStudios) || [];
  const toggleFollow = useMutation(api.users.toggleFollow); // Mutation


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
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 70,
        damping: 18,
        mass: 1
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar isLoggedIn={true} />
      
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <DirectoryHeader 
          title="Studios & Brands" 
          description="Connect with world-class game development studios, indie creators, and gaming professionals. Find services, hire talent, or showcase your portfolio."
        />
        
        <div className="mb-12">
          <DirectoryFilters />
        </div>
        
        {studios.length === 0 ? (
           <div className="text-center text-gray-500 py-20">No studios found yet. Be the first to join!</div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
             {studios.map((s, i) => (
               <Link href={`/profile/${s._id}`} key={i}>
             <motion.div 
               variants={item}
               whileHover={{ y: -8, scale: 1.02 }}
               className="group relative h-[302px] rounded-[31px] border border-[#262626] bg-[#0B0B0B] p-3 flex flex-col hover:border-[#7628DB]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(118,40,219,0.1)]"
             >
               <div className="flex-1 w-full relative rounded-[20px] overflow-hidden bg-white flex items-center justify-center">
                 <Image 
                   src={s.coverImage || "/images/Hammer Games.png"} 
                   alt={s.name || "Studio"}
                   width={200}
                   height={120}
                   className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
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
                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={async (e: React.MouseEvent) => {
                     e.preventDefault();
                     e.stopPropagation();
                     
                     if (!user) {
                        alert("Please sign in to follow studios.");
                        return;
                     }

                     // Assuming we can get userID from user object or we need to query checking email match?
                     // useAuth user usually has user ID if properly enriched, but let's check.
                     // The user object from useAuth() comes from AuthProvider which fetches API.users.getUserByEmail
                     // So user should have _id.
                     
                     try {
                        const result = await toggleFollow({ 
                            followerId: user.id as Id<"users">, // Use ID from auth context
                            followingId: s._id 
                        });
                        
                        if (result.following) {
                            alert(`You are now following ${s.name}!`);
                        } else {
                            alert(`Unfollowed ${s.name}.`);
                        }
                     } catch (err: any) {
                         // Safely handle unknown error type
                         const errorMessage = err instanceof Error ? err.message : "Unknown error";
                         if (errorMessage.includes("self")) {
                             alert("You cannot follow yourself.");
                         } else {
                             console.error(err);
                             alert("Failed to follow. Please try again.");
                         }
                     }
                   }}
                   className="w-10 h-10 rounded-full border border-[#7628DB] text-[#7628DB] flex items-center justify-center hover:bg-[#7628DB] hover:text-white transition-all shadow-[0_0_15px_rgba(118,40,219,0.2)] z-10 relative cursor-pointer"
                 >
                   <Plus className="w-5 h-5" />
                 </motion.button>
               </div>
             </motion.div>
             </Link>
           ))}
        </motion.div>
        )}
      </div>
    </main>
  );
}
