"use client";

import Navbar from "@/components/landing/Navbar";
import { ProfileHeader, ProfileContent } from "@/components/profile";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar isLoggedIn={true} />
      
      {/* Profile Content */}
      <div className="w-full">
        <ProfileHeader />
        <ProfileContent />
      </div>
    </main>
  );
}
