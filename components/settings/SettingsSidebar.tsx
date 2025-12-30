"use client";

import Image from "next/image";
import { SettingsTab } from "@/app/settings/page";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const { user } = useAuth();
  
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  const displayName = dbUser?.name || user?.name || "User";
  const avatarUrl = dbUser?.avatar || user?.avatar || "/images/avatar.png";

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "profile", label: "Edit Profile" },
    { id: "notifications", label: "Notifications" },
    { id: "billing", label: "Billing / Payments" },
    { id: "security", label: "Security" },
    { id: "support", label: "Help / Support" },
  ];

  return (
    <div className="bg-[#0B0B0B] border border-white/5 rounded-[50px] py-12 flex flex-col items-start shadow-2xl min-h-[640px] px-10">
      {/* User Header Capsule */}
      <div className="w-full flex justify-start mb-10">
        <div className="inline-flex items-center gap-4 bg-[#111] border border-white/10 rounded-full pl-2 pr-8 py-2 shadow-inner">
          <div className="w-12 h-12 rounded-full overflow-hidden relative border border-white/20">
            <Image src={avatarUrl} alt="User" fill className="object-cover" />
          </div>
          <span className="text-white text-lg font-dm-sans tracking-tight">{displayName}</span>
        </div>
      </div>

      {/* Separator Line */}
      <div className="w-[calc(100%+80px)] -ml-10 border-t border-white/5 mb-12"></div>

      {/* Navigation Links */}
      <nav className="flex flex-col items-start gap-8 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="group relative flex items-center justify-start w-full"
          >
            <div className="relative inline-flex items-center">
              {/* Active Indicator - Solid Vertical Green Line */}
              {activeTab === tab.id && (
                <div className="absolute -left-5 w-[4px] h-6 bg-[#26AB4C] shadow-[0_0_10px_rgba(38,171,76,0.4)]" />
              )}
              
              <span className={`text-lg font-dm-sans transition-all duration-300 ${
                activeTab === tab.id
                  ? "text-[#7628db] font-medium"
                  : "text-white hover:text-white/60"
              }`}>
                {tab.label}
              </span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
