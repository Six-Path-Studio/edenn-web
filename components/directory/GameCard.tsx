"use client";

import Image from "next/image";
import { Triangle } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";

interface GameCardProps {
  id: string;
  image: string;
  title: string;
  studio: string;
}

export function GameCard({ id, image, title, studio }: GameCardProps) {
  const { user } = useAuth();
  const upvoteGame = useMutation(api.games.upvoteGame);
  
  // Fetch full game data for upvote status/count
  const game = useQuery(api.games.getGame, { id: id as any });
  const currentUser = useQuery(api.users.getUserByEmail, user?.email ? { email: user.email } : "skip");

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await upvoteGame({ gameId: id as any });
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  const upvotes = game?.upvotes || 0;
  const isUpvoted = currentUser && game?.upvotedBy?.includes(currentUser._id);

  return (
    <Link href={`/games/${id}`} className="block group bg-[#0a0a0a] rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
      {/* Image Area */}
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Upvote Badge Overlay */}
        <div className="absolute top-4 left-4">
           <button 
             onClick={handleUpvote}
             className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md border transition-all ${
               isUpvoted 
                 ? "bg-[#8b5cf6] border-[#8b5cf6] text-white" 
                 : "bg-black/40 border-white/10 text-white hover:bg-white/10"
             }`}
           >
             <Triangle className={`w-3.5 h-3.5 fill-current mb-0.5`} />
             <span className="text-[10px] font-bold">{upvotes}</span>
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden relative shrink-0 border border-white/5">
               <Image src={game?.studio?.avatar || "/images/avatar.png"} alt="Studio" fill className="object-cover" />
            </div>
            <div>
               <h3 className="text-white font-bold text-base leading-tight group-hover:text-primary transition-colors">{title}</h3>
               <p className="text-white/40 text-xs">{studio}</p>
            </div>
         </div>

         <div className="flex h-10 px-4 items-center bg-white/5 rounded-full text-xs font-dm-sans font-bold text-white group-hover:bg-primary transition-all">
            Link
         </div>
      </div>
    </Link>
  );
}
