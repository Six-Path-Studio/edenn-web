"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Triangle, ExternalLink } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Container from "@/components/ui/Container";

// Mock data - will be replaced with Convex fetch
const mockProfile = {
  id: "1",
  name: "Black Rock",
  tagline: "Lorem ipsum dolor sit ame",
  upvotes: 543,
  coverImage: "/images/featured-game.jpg",
  about: "Lorem ipsum dolor sit amet consectetur. Urna faucibus tempus ultrices a aliquam in donec lacus velit. Amet nunc lacinia tortor id. Nulla sed nisl ut purus.",
  location: "Lagos, Nigeria",
  locationFlag: "🇳🇬",
  studioName: "@Dirtymonkey",
  studioLink: "/studio/dirtymonkey",
  socials: {
    tiktok: "Manjalee",
    youtube: "Manjalee",
    twitter: "Manjalee",
    instagram: "Manjalee",
    twitch: "Manjalee",
  },
};

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  const profile = mockProfile; // Replace with actual fetch by params.id

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn={true} />

      <Container className="pt-24 pb-20">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-linear-to-r from-[#7628db] to-[#40A261] rounded-[32px] p-8 flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-preahvihear text-white mb-2">{profile.name}</h1>
            <p className="text-white/60 font-dm-sans">{profile.tagline}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#111]/50 hover:bg-[#111]/70 text-white px-6 py-3 rounded-full font-dm-sans font-semibold flex items-center gap-2 transition-colors backdrop-blur-sm"
          >
            <Triangle size={14} className="fill-current" />
            Upvote • {profile.upvotes}
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-video rounded-[32px] overflow-hidden group"
            >
              <Image
                src={profile.coverImage}
                alt={profile.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>

            {/* Featured Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#111] border border-white/5 rounded-[32px] p-8"
            >
              <h2 className="text-2xl font-preahvihear text-white text-center mb-6">Featured</h2>
              <div className="bg-[#1a1a1a] rounded-[24px] aspect-video flex items-center justify-center">
                <span className="text-white/20 font-dm-sans">Video or Image</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* About Game Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-[#111] border border-white/5 rounded-[32px] p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-linear-to-br from-[#7628db] to-[#40A261]" />
                <h3 className="text-lg font-dm-sans font-semibold text-white">About Game</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-white mb-2">Personal Details:</h4>
                  <p className="text-sm text-white/40 font-dm-sans leading-relaxed">{profile.about}</p>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-sm text-white font-dm-sans">Location:</span>
                  <span className="text-sm text-white/60 font-dm-sans">{profile.location} {profile.locationFlag}</span>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-sm text-white font-dm-sans">Studio:</span>
                  <Link href={profile.studioLink} className="text-sm text-white/60 font-dm-sans underline hover:text-white transition-colors">
                    {profile.studioName}
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Social Links Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-[#111] border border-white/5 rounded-[32px] p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-linear-to-br from-[#7628db] to-[#40A261]" />
                <h3 className="text-lg font-dm-sans font-semibold text-white">Social Links</h3>
              </div>

              <div className="space-y-4">
                {Object.entries(profile.socials).map(([platform, handle]) => (
                  <div key={platform} className="flex justify-between items-center">
                    <span className="text-sm text-white font-dm-sans capitalize">{platform}:</span>
                    <motion.a
                      href={`https://${platform}.com/${handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#26AB4C]/20 text-[#26AB4C] px-4 py-1.5 rounded-full text-sm font-dm-sans font-medium hover:bg-[#26AB4C]/30 transition-colors flex items-center gap-1"
                    >
                      {handle}
                      <ExternalLink size={12} />
                    </motion.a>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </main>
  );
}
