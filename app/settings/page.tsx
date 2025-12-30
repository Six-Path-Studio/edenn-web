"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Container from "@/components/ui/Container";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import EditProfileSection from "@/components/settings/EditProfileSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import BillingSection from "@/components/settings/BillingSection";
import SecuritySection from "@/components/settings/SecuritySection";
import HelpSupportSection from "@/components/settings/HelpSupportSection";

export type SettingsTab = "profile" | "notifications" | "billing" | "security" | "support";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderSection = () => {
    switch (activeTab) {
      case "profile":
        return <EditProfileSection />;
      case "notifications":
        return <NotificationsSection />;
      case "billing":
        return <BillingSection />;
      case "security":
        return <SecuritySection />;
      case "support":
        return <HelpSupportSection />;
      default:
        return <EditProfileSection />;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar isLoggedIn={true} />
      
      <Container className="pt-24 pb-20 flex-1 flex flex-col">
        <div className="flex-1 flex gap-8">
          {/* Sidebar */}
          <aside className="w-full max-w-[400px]">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </aside>

          {/* Main Content Areas */}
          <div className="flex-1 flex flex-col gap-10 min-w-0">
            {renderSection()}
          </div>
        </div>
      </Container>
    </main>
  );
}
