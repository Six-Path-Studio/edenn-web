"use client";

import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import Image from "next/image";
import Container from "@/components/ui/Container";

interface GameCardProps {
  title: string;
  studio: string;
  imageSrc: string;
  avatarSrc: string;
}

const GameCard = ({ title, studio, imageSrc, avatarSrc }: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative h-[260px] sm:h-[280px] lg:h-[302px] rounded-[20px] lg:rounded-[31px] border border-[#262626] bg-[#0E0E0E] p-2 lg:p-3 flex flex-col hover:border-primary/50 transition-colors duration-300"
    >
      {/* Image Area */}
      <div className="flex-1 w-full relative rounded-[16px] lg:rounded-[20px] overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Footer */}
      <div className="h-[48px] lg:h-[57px] px-1 lg:px-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full relative overflow-hidden flex items-center justify-center shrink-0 border border-[#262626]">
            <Image
              src={avatarSrc}
              alt={studio}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-white font-mulish font-black text-[14px] lg:text-[17px] leading-none mb-0.5 lg:mb-1">{title}</h3>
            <span className="text-[#727272] text-[10px] lg:text-[11px] font-medium leading-none">@{studio}</span>
          </div>
        </div>

        {/* Plus Button */}
        <button className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-[#7628DB] text-[#7628DB] flex items-center justify-center hover:bg-[#7628DB] hover:text-white transition-all">
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default function Hero() {
  const cards = [
    { title: "Sabi Driver", studio: "Gameverse Africa", imageSrc: "/images/Splash Loading Screen.jpg", avatarSrc: "/images/Group 34374.png" },
    { title: "Otite Reborn", studio: "Logic Dev Studios", imageSrc: "/images/Screenshot 2025-06-13 184845 1.png", avatarSrc: "/images/Mask group.png" },
    { title: "Beyond Service", studio: "Goondu Interactive", imageSrc: "/images/BeyondService.png", avatarSrc: "/images/avatar.png" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col pt-24 sm:pt-28 lg:pt-52 pb-10 sm:pb-16 lg:pb-20">
      <Container className="flex-1 flex flex-col">
        {/* Text Content */}
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 lg:space-y-6 mx-auto z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-power font-normal text-[#FFFFFF] text-[32px] sm:text-[42px] md:text-[52px] lg:text-[63.6px] leading-[100%] tracking-[0%] text-center max-w-[811px]"
          >
            Discover Talents, Creatives, <br /> Techies & Studios
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-text-secondary text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed px-4"
          >
            The premier platform for creative technologists to be seen. Build your dynamic profile, get discovered, and work with world-class studios.          </motion.p>

          {/* Main Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="w-full max-w-md lg:max-w-2xl mt-4 lg:mt-6 relative group px-4 sm:px-0"
          >
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#121212] border border-input-border rounded-xl lg:rounded-2xl py-3 lg:py-4 px-6 text-white placeholder:text-text-secondary focus:border-white/20 transition-colors outline-none text-base lg:text-lg"
            />
            <div className="absolute inset-y-0 right-6 sm:right-6 lg:right-6 flex items-center pointer-events-none group-focus-within:text-white">
              <Search className="w-4 h-4 lg:w-5 lg:h-5 text-text-secondary transition-colors group-focus-within:text-white" />
            </div>
          </motion.div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full mt-12 sm:mt-16 lg:mt-20">
          {cards.map((card, index) => (
            <GameCard key={index} {...card} />
          ))}
        </div>
      </Container>
    </section>
  );
}
