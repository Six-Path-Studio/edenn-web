"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { Plus, ChevronRight, Check, Triangle } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";

interface FeaturedItemProps {
  id: string;
  studioId?: string;
  title: string;
  studio: string;
  imageSrc: string;
  avatarSrc: string;
  description: string;
  stats: {
    posts: number;
    reviews: number;
    upvotes: number;
  };
}

interface StudioItemProps {
  id: string;
  type: "studio" | "creator";
  name: string;
  handle: string;
  logoSrc: string;
  avatarSrc: string;
  description: string;
  stats: {
    posts: number;
    reviews: number;
    upvotes: number;
  };
}

interface ArticleItemProps {
  title: string;
  author: string;
  date: string;
  stats: {
    posts: number;
    reviews: number;
    upvotes: number;
  };
}

// Helper Component for Follow Button
// Helper Component for Follow Button
const FollowButton = ({ targetId }: { targetId?: string }) => {
  const { user, isAuthenticated } = useAuth();
  const toggleFollow = useMutation(api.users.toggleFollow);

  // Conditionally fetch isFollowing only if we have user and targetId
  const isFollowing = useQuery(api.users.isFollowing, (user && targetId) ? { followerId: user.id as any, followingId: targetId as any } : "skip");

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      alert("Please login to follow.");
      return;
    }
    if (!targetId) return;

    try {
      await toggleFollow({ followingId: targetId as any });
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  if (!targetId) return null;

  return (
    <button
      onClick={handleToggle}
      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all z-20 relative ${isFollowing ? 'bg-primary border-primary text-white' : 'border-[#7628DB] text-[#7628DB] hover:bg-[#7628DB] hover:text-white'}`}
    >
      {isFollowing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
    </button>
  );
};

const FeaturedItem = ({ id, studioId, title, studio, imageSrc, avatarSrc, description, stats }: FeaturedItemProps) => {
  return (
    <Link href={`/games/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-1 cursor-pointer"
      >
        {/* Game Card */}
        <div className="group relative h-[302px] rounded-[31px] border border-[#262626] bg-[#0B0B0B] p-3 flex flex-col hover:border-primary/50 transition-colors duration-300">
          <div className="flex-1 w-full relative rounded-[20px] overflow-hidden">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="h-[57px] px-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full relative overflow-hidden shrink-0 border border-[#262626] bg-black">
                <Image src={avatarSrc} alt={studio} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                {/* Title - Mulish, 900, 17px */}
                <h3 className="text-white font-mulish font-black text-[17px] leading-none mb-1">{title}</h3>
                <span className="text-[#727272] text-[11px] font-medium leading-none">@{studio}</span>
              </div>
            </div>

            <FollowButton targetId={studioId} />

          </div>
        </div>

        {/* Description Card */}
        <div className="rounded-[20px] border-[1.5px] border-[#262626] bg-[#0B0B0B] py-[26px] px-[22px] flex flex-col gap-4">
          <span className="self-start h-[43px] flex items-center bg-[#1A1A1A] text-[#9CA3AF] text-xs px-4 rounded-[35px] border border-[#262626]">
            Description
          </span>
          <p className="font-dm-sans font-normal text-[#9CA3AF] text-[16px] leading-[20px] tracking-[-0.01em] line-clamp-3">
            {description}
          </p>
        </div>

        {/* Stats Row - Separate Container */}
        <div className="rounded-[20px] border border-[#262626] bg-[#0B0B0B] py-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <Image src="/images/icon-post.png.svg" alt="Posts" width={18} height={18} />
            <span>{stats.posts} posts</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <Image src="/images/icon-review.png.svg" alt="Reviews" width={18} height={18} />
            <span>{stats.reviews} reviews</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-[#1A1A1A] border border-[#262626] px-4 py-2 rounded-full">
            <Image src="/images/SVG.svg" alt="Upvotes" width={14} height={14} />
            <span className="text-[#9CA3AF]">{stats.upvotes}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const StudioItem = ({ id, type, name, handle, logoSrc, avatarSrc, description, stats }: StudioItemProps) => {
  const href = type === "studio" ? `/studio/${id}` : `/creators/${id}`;

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3 cursor-pointer"
      >
        {/* Studio Card with Logo */}
        <div className="group relative h-[302px] rounded-[31px] border border-[#262626] bg-[#0B0B0B] p-3 flex flex-col hover:border-primary/50 transition-colors duration-300">
          <div className="flex-1 w-full relative rounded-[20px] overflow-hidden bg-white flex items-center justify-center">
            <Image
              src={logoSrc}
              alt={name}
              width={200}
              height={120}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="h-[57px] px-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full relative overflow-hidden shrink-0 border border-[#262626] bg-black">
                <Image src={avatarSrc} alt={name} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                {/* Title - Mulish, 900, 17px */}
                <h3 className="text-white font-mulish font-black text-[17px] leading-none mb-1">{name}</h3>
                <span className="text-[#727272] text-[11px] font-medium leading-none">@{handle}</span>
              </div>
            </div>

            <FollowButton targetId={id} />

          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ArticleItem = ({ title, author, date, stats }: ArticleItemProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Article Card */}
      <div className="rounded-[31px] border border-[#262626] bg-[#0E0E0E] p-6 flex flex-col hover:border-primary/50 transition-colors duration-300 min-h-[220px]">
        <span className="text-[#845ED3] text-sm font-medium mb-3">New Read</span>
        {/* Title - DM Sans, 700, 27.2px, line-height 30.52px, letter-spacing -1px */}
        <h3 className="text-white font-dm-sans font-bold text-[22px] md:text-[24px] leading-tight tracking-tight mb-4 line-clamp-4">{title}</h3>
        <p className="text-[#9CA3AF] text-sm mb-1">
          {author}
        </p>
        <span className="text-[#5E8BD3] text-xs">{date}</span>
      </div>

      {/* Stats Row - Separate Container */}
      <div className="rounded-[20px] border border-[#262626] bg-[#0E0E0E] py-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
          <div className="w-5 h-5 flex items-center justify-center bg-[#5ED3C9]/10 rounded-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5ED3C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <span className="text-[12px]">{stats.posts} posts</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
          <div className="w-5 h-5 flex items-center justify-center bg-[#D39C5E]/10 rounded-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D39C5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <span className="text-[12px]">{stats.reviews} reviews</span>
        </div>
        <div className="flex items-center gap-2 text-sm bg-[#1A1A1A] border border-[#262626] px-4 py-1.5 rounded-full">
          <Triangle className="w-3 h-3 fill-[#D3745E] text-[#D3745E]" />
          <span className="text-[#9CA3AF] text-[12px] font-bold">{stats.upvotes}</span>
        </div>
      </div>
    </div>
  );
};

const articleItems: ArticleItemProps[] = [
  {
    title: "Africa’s game studios are quietly building global products the world is just beginning to notice",
    author: "by: Chidi Light",
    date: "2:16 PM UTC • July 20, 2023",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  {
    title: "How creative tech communities in emerging regions are redefining access, and opportunity",
    author: "by: Chidi Light",
    date: "2:16 PM UTC • July 20, 2023",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  {
    title: "Why the next wave of impactful game studios may come from overlooked ecosystems",
    author: "by: Chidi Light",
    date: "2:16 PM UTC • July 20, 2023",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
];

export default function FeaturedSection() {
  const featuredGames = useQuery(api.games.getFeaturedGames) || [];
  const featuredStudios = useQuery(api.users.getFeaturedStudios) || [];
  const featuredCreators = useQuery(api.users.getFeaturedCreators) || [];

  return (
    <section className="py-20 relative">
      <Container>
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white text-[32px] sm:text-[42px] md:text-[52px] lg:text-[63.6px] font-power font-normal leading-tight mx-auto max-w-2xl px-4"
          >
            Organisation spotlight: <br /> Studio/Organisation of the Week
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#9CA3AF] text-sm  lg:text-base font-preahvihear"
          >
            Discover brands and studios shaping the future of the creative tech industry
          </motion.p>
        </div>

        {/* Video Games Container */}
        {featuredGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#121212] rounded-[48px] p-4 md:p-10 relative border border-[#1F1F1F]"
          >
            {/* Video Games Tag */}
            <div className="mb-8 lg:text-left text-center">
              <span className="bg-[#DDC984] text-black font-dm-sans font-medium w-[158px] h-[43px] px-[4px] rounded-[11px] text-[16px] leading-none tracking-[-1px] inline-flex items-center justify-center">
                Video Games
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredGames.map((game, idx) => (
                <FeaturedItem
                  key={idx}
                  id={game._id}
                  studioId={game.studioId}
                  title={game.title}
                  studio={game.studio?.name || "Indie"}
                  imageSrc={game.coverImage || "/images/unbroken_art.png"}
                  avatarSrc={game.studio?.avatar || "/images/avatar.png"}
                  description={game.description || "No description available."}
                  stats={{
                    posts: 0,
                    reviews: 0,
                    upvotes: game.upvotes || 0
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Studios Container */}
        {featuredStudios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#121212] rounded-[48px] p-4 md:p-10 relative border border-[#1F1F1F] mt-8"
          >
            {/* Studios Tag */}
            <div className="mb-8 lg:text-left text-center">
              <span className="bg-[#D3745E] text-white font-dm-sans font-medium w-[158px] h-[43px] px-[4px] rounded-[11px] text-[16px] leading-none tracking-[-1px] inline-flex items-center justify-center">
                Studios
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStudios.map((studio, idx) => (
                <StudioItem
                  key={idx}
                  id={studio._id}
                  type="studio"
                  name={studio.name || "Studio"}
                  handle={(studio.name || "").toLowerCase().replace(/\s+/g, '')}
                  logoSrc={studio.coverImage || "/images/Hammer Games.png"}
                  avatarSrc={studio.avatar || "/images/Hammer Games.png"}
                  description={studio.bio || "No bio available."}
                  stats={{ posts: 0, reviews: 0, upvotes: 0 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Creators Container */}
        {featuredCreators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#121212] rounded-[48px] p-4 md:p-10 relative border border-[#1F1F1F] mt-8"
          >
            {/* Creators Tag */}
            <div className="mb-8 lg:text-left text-center">
              <span className="bg-[#DDC984] text-black font-dm-sans font-medium w-[158px] h-[43px] px-[4px] rounded-[11px] text-[16px] leading-none tracking-[-1px] inline-flex items-center justify-center">
                Creators
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCreators.map((creator, idx) => (
                <StudioItem
                  key={idx}
                  id={creator._id}
                  type="creator"
                  name={creator.name || "Creator"}
                  handle={(creator.name || "").toLowerCase().replace(/\s+/g, '')}
                  logoSrc={creator.coverImage || "/images/Hammer Games.png"}
                  avatarSrc={creator.avatar || "/images/Hammer Games.png"}
                  description={creator.bio || "No bio available."}
                  stats={{ posts: 0, reviews: 0, upvotes: 0 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#171717] rounded-[48px] p-4 md:p-10 relative border border-[#262626] mt-12"
        >
          {/* Top Reads Tag - DM Sans, 500, 16px, letter-spacing -1px */}
          <div className="mb-8 lg:text-left text-center">
            <button className="bg-[#5E7BD3] text-white font-dm-sans font-medium h-[43px] px-8 rounded-[11px] text-[16px] leading-none tracking-tight inline-flex items-center justify-center shadow-[0_0_20px_rgba(94,123,211,0.3)]">
              Top Reads
            </button>
          </div>

          {/* Swiper Carousel */}
          <div className="relative">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: ".swiper-button-next-custom",
              }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="!overflow-visible"
            >
              {articleItems.map((item, idx) => (
                <SwiperSlide key={idx}>
                  <ArticleItem {...item} />
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Navigation Arrow */}
            <button className="swiper-button-next-custom absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#7628DB] text-white flex items-center justify-center hover:bg-[#8a3be8] transition-colors shadow-lg z-20">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
