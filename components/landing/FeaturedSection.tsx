"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { Plus, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface FeaturedItemProps {
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

const FeaturedItem = ({ title, studio, imageSrc, avatarSrc, description, stats }: FeaturedItemProps) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      className="flex flex-col gap-3"
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
            <div className="w-12 h-12 rounded-full relative overflow-hidden shrink-0 border border-[#262626]">
               <Image src={avatarSrc} alt={studio} fill className="object-cover" />
            </div>
        <div className="flex flex-col justify-center">
              {/* Title - Mulish, 900, 17px */}
              <h3 className="text-white font-mulish font-black text-[17px] leading-none mb-1">{title}</h3>
              <span className="text-[#727272] text-[11px] font-medium leading-none">@{studio}</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full border border-[#7628DB] text-[#7628DB] flex items-center justify-center hover:bg-[#7628DB] hover:text-white transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Description Card */}
      <div className="rounded-[20px] border-[1.5px] border-[#262626] bg-[#0B0B0B] py-[26px] px-[22px] flex flex-col gap-4">
        <span className="self-start h-[43px] flex items-center bg-[#1A1A1A] text-[#9CA3AF] text-xs px-4 rounded-[35px] border border-[#262626]">
          Description
        </span>
        <p className="font-dm-sans font-normal text-[#9CA3AF] text-[16px] leading-[20px] tracking-[-0.01em]">
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
  );
};

const StudioItem = ({ name, handle, logoSrc, avatarSrc, description, stats }: StudioItemProps) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      className="flex flex-col gap-3"
    >
      {/* Studio Card with Logo */}
      <div className="group relative h-[302px] rounded-[31px] border border-[#262626] bg-[#0B0B0B] p-3 flex flex-col hover:border-primary/50 transition-colors duration-300">
        <div className="flex-1 w-full relative rounded-[20px] overflow-hidden bg-white flex items-center justify-center">
          <Image 
            src={logoSrc} 
            alt={name}
            width={200}
            height={120}
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="h-[57px] px-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full relative overflow-hidden shrink-0 border border-[#262626]">
               <Image src={avatarSrc} alt={name} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              {/* Title - Mulish, 900, 17px */}
              <h3 className="text-white font-mulish font-black text-[17px] leading-none mb-1">{name}</h3>
              <span className="text-[#727272] text-[11px] font-medium leading-none">@{handle}</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full border border-[#7628DB] text-[#7628DB] flex items-center justify-center hover:bg-[#7628DB] hover:text-white transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ArticleItem = ({ title, author, date, stats }: ArticleItemProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Article Card */}
      <div className="rounded-[31px] border border-[#262626] bg-[#0B0B0B] p-6 flex flex-col hover:border-primary/50 transition-colors duration-300">
        <span className="text-[#D3745E] text-sm font-medium mb-3">New Read</span>
        {/* Title - DM Sans, 700, 27.2px, line-height 30.52px, letter-spacing -1px */}
        <h3 className="text-white font-dm-sans font-bold text-[27.2px] leading-[30.52px] tracking-[-1px] mb-4">{title}</h3>
        <p className="text-[#9CA3AF] text-sm">
          {author}
        </p>
        <span className="text-[#727272] text-xs mt-1">{date}</span>
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
    </div>
  );
};

const studioItems: StudioItemProps[] = [
  { 
    name: "Hammer Games", 
    handle: "#3D Artist #gamer", 
    logoSrc: "/images/Hammer Games.png", 
    avatarSrc: "/images/Hammer Games.png",
    description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  { 
    name: "Deluxe Studio", 
    handle: "deluxestudios", 
    logoSrc: "/images/Deluxe Studio.png", 
    avatarSrc: "/images/Deluxe Studio.png",
    description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  { 
    name: "Toon Central", 
    handle: "tooncentral", 
    logoSrc: "/images/Toon Central.png", 
    avatarSrc: "/images/Toon Central.png",
    description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
];

const creatorItems: StudioItemProps[] = [
  { 
    name: "Hammer Games", 
    handle: "#3D Artist #gamer", 
    logoSrc: "/images/Hammer Games.png", 
    avatarSrc: "/images/Hammer Games.png",
    description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  { 
    name: "Hammer Games", 
    handle: "#3D Artist #gamer", 
    logoSrc: "/images/Hammer Games.png", 
    avatarSrc: "/images/Hammer Games.png",
    description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  { 
    name: "Hammer Games", 
    handle: "#3D Artist #gamer", 
    logoSrc: "/images/Hammer Games.png", 
    avatarSrc: "/images/Hammer Games.png",
    description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
];

const articleItems: ArticleItemProps[] = [
  { 
    title: "Silicon Valley Bank's crash is providing valuable lessons all over the world",
    author: "Christine Hall",
    date: "2:16 PM UTC • July 20, 2023",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  { 
    title: "Silicon Valley Bank's crash is providing valuable lessons all over the world",
    author: "Christine Hall",
    date: "2:16 PM UTC • July 20, 2023",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
  { 
    title: "Silicon Valley Bank's crash is providing valuable lessons all over the world",
    author: "Christine Hall",
    date: "2:16 PM UTC • July 20, 2023",
    stats: { posts: 2, reviews: 141, upvotes: 174 }
  },
];

export default function FeaturedSection() {
  const items = [
    { 
      title: "Unbroken", 
      studio: "Raven Illusion Studio", 
      imageSrc: "/images/Image1gun.png", 
      avatarSrc: "/images/avatar.png",
      description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
      stats: { posts: 2, reviews: 141, upvotes: 174 }
    },
    { 
      title: "Vodou", 
      studio: "Juju Games", 
      imageSrc: "/images/bazz adv.png", 
      avatarSrc: "/images/avatar.png",
      description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
      stats: { posts: 2, reviews: 141, upvotes: 174 }
    },
    { 
      title: "Vodou", 
      studio: "Juju Games", 
      imageSrc: "/images/BeyondService.png", 
      avatarSrc: "/images/avatar.png",
      description: "Lorem ipsum dolor sit amet consectetur. Tortor ut ornare quis mauris. Dapibus ut lacus suspendisse lectus integer justo nibh tristique quisque. Sem vitae convallis vulputate ac. Id et sagittis blandit a volutpat.",
      stats: { posts: 2, reviews: 141, upvotes: 174 }
    },
  ];

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
            className="text-white text-5xl font-power font-normal leading-tight"
          >
            Featured for the <br /> week
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#9CA3AF] text-base"
          >
            Skip the hassle of building from scratch. Get a fully functional AI agent asap
          </motion.p>
        </div>

        {/* Video Games Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#121212] rounded-[48px] p-8 md:p-10 relative border border-[#1F1F1F]"
        >
          {/* Video Games Tag - DM Sans, 500, 16px, letter-spacing -1px */}
          <div className="mb-8">
            <span className="bg-[#DDC984] text-black font-dm-sans font-medium w-[158px] h-[43px] px-[4px] rounded-[11px] text-[16px] leading-none tracking-[-1px] inline-flex items-center justify-center">
              Video Games
            </span>
          </div>

          {/* Grid */}
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-50px" }}
             variants={{
               visible: {
                 transition: {
                   staggerChildren: 0.15
                 }
               }
             }}
             className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {items.map((item, idx) => (
              <FeaturedItem key={idx} {...item} />
            ))}
          </motion.div>
        </motion.div>

        {/* Studios Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#121212] rounded-[48px] p-8 md:p-10 relative border border-[#1F1F1F] mt-8"
        >
          {/* Studios Tag - DM Sans, 500, 16px, letter-spacing -1px */}
          <div className="mb-8">
            <span className="bg-[#D3745E] text-white font-dm-sans font-medium w-[158px] h-[43px] px-[4px] rounded-[11px] text-[16px] leading-none tracking-[-1px] inline-flex items-center justify-center">
              Studios
            </span>
          </div>

          {/* Grid */}
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-50px" }}
             variants={{
               visible: {
                 transition: {
                   staggerChildren: 0.15
                 }
               }
             }}
             className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {studioItems.map((item, idx) => (
              <StudioItem key={idx} {...item} />
            ))}
          </motion.div>
        </motion.div>

        {/* Creators Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#121212] rounded-[48px] p-8 md:p-10 relative border border-[#1F1F1F] mt-8"
        >
          {/* Creators Tag - DM Sans, 500, 16px, letter-spacing -1px */}
          <div className="mb-8">
            <span className="bg-[#DDC984] text-black font-dm-sans font-medium w-[158px] h-[43px] px-[4px] rounded-[11px] text-[16px] leading-none tracking-[-1px] inline-flex items-center justify-center">
              Creators
            </span>
          </div>

          {/* Grid */}
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-50px" }}
             variants={{
               visible: {
                 transition: {
                   staggerChildren: 0.15
                 }
               }
             }}
             className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {creatorItems.map((item, idx) => (
              <StudioItem key={idx} {...item} />
            ))}
          </motion.div>
        </motion.div>

        {/* Top Reads Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#121212] rounded-[48px] p-8 md:p-10 relative border border-[#1F1F1F] mt-8"
        >
          {/* Top Reads Tag - DM Sans, 500, 16px, letter-spacing -1px */}
          <div className="mb-8">
            <span className="bg-[#5EBED3] text-black font-dm-sans font-medium w-[158px] h-[43px] px-[4px] rounded-[11px] text-[16px] leading-none tracking-[-1px] inline-flex items-center justify-center">
              Top Reads
            </span>
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
