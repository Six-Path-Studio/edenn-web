"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import EditProfileSection from "@/components/settings/EditProfileSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import BillingSection from "@/components/settings/BillingSection";
import SecuritySection from "@/components/settings/SecuritySection";
import HelpSupportSection from "@/components/settings/HelpSupportSection";
import { Menu, X } from "lucide-react";

export type SettingsTab = "profile" | "notifications" | "billing" | "security" | "support";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <main className="min-h-screen bg-transparent text-foreground flex flex-col pt-24 pb-20 px-4 md:px-0">
      
      <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col lg:flex-row gap-8 relative px-4 md:px-6">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <div className="lg:contents">
            <AnimatePresence mode="wait">
                <motion.aside 
                    key="sidebar"
                    initial={false}
                    animate={{ 
                        x: (typeof window !== 'undefined' && window.innerWidth < 1024) 
                            ? (isSidebarOpen ? 0 : -320) 
                            : 0 
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`
                        fixed lg:static top-[90px] bottom-4 left-4 z-101 w-[300px] lg:w-[400px] rounded-[40px] lg:rounded-none
                        lg:block bg-transparent lg:bg-transparent
                    `}
                >
                    <div className="h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                        <SettingsSidebar 
                            activeTab={activeTab} 
                            onTabChange={(tab) => {
                                setActiveTab(tab);
                                setIsSidebarOpen(false);
                            }} 
                        />
                    </div>
                </motion.aside>
            </AnimatePresence>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Section Breadcrumb/Toggle for Mobile */}
          <div className="lg:hidden mb-10 flex items-center gap-4">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
             >
                <Menu size={24} />
             </button>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#7628DB] font-bold">Settings</span>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{activeTab}</h2>
             </div>
          </div>
          
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {renderSection()}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
