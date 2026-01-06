"use client";

import { ProfileHeader, ProfileContent } from "@/components/profile";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24">
      
      {/* Profile Content */}
      <div className="w-full">
        <ProfileHeader />
        <ProfileContent />
      </div>
    </main>
  );
}
