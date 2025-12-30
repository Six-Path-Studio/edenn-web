import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function NotificationsSection() {
  const { user } = useAuth();
  
  // Fetch full user profile to get preferences
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  const updatePreferences = useMutation(api.users.updateNotificationPreferences);

  const [settings, setSettings] = useState({
    upvote: true,
    messages: true,
    comments: true,
    gifts: true,
  });

  // Sync with DB when loaded
  useEffect(() => {
    if (dbUser?.notificationPreferences) {
      setSettings({
        upvote: dbUser.notificationPreferences.emailUpvotes ?? true,
        messages: dbUser.notificationPreferences.emailMessages ?? true,
        comments: dbUser.notificationPreferences.emailComments ?? true,
        gifts: dbUser.notificationPreferences.emailGifts ?? true,
      });
    }
  }, [dbUser]);

  const toggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings); // Optimistic

    if (dbUser?._id) {
        try {
            await updatePreferences({
                userId: dbUser._id,
                preferences: {
                    emailUpvotes: newSettings.upvote,
                    emailMessages: newSettings.messages,
                    emailComments: newSettings.comments,
                    emailGifts: newSettings.gifts,
                }
            });
        } catch (err) {
            console.error("Failed to save preferences", err);
            setSettings(settings); // Revert on error
        }
    }
  };

  const notificationOptions = [
    { key: "upvote", label: "Receive upvote notifications for on email" },
    { key: "messages", label: "Receive message notifications via email" },
    { key: "comments", label: "Receive comment notification via email" },
    { key: "gifts", label: "Receive gift notifications" },
  ];

  return (
    <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-5xl font-preahvihear text-white tracking-tight mb-12">Notification</h1>

      <div className="border-t border-white/5 pt-12 space-y-8 max-w-2xl">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex justify-between items-center group cursor-pointer" onClick={() => toggle(option.key as any)}>
            <span className="text-white/40 font-dm-sans group-hover:text-white/60 transition-colors">
              {option.label}
            </span>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors relative ${settings[option.key as keyof typeof settings] ? "bg-[#3B82F6]" : "bg-[#222]"}`}>
              <div 
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                  settings[option.key as keyof typeof settings] ? "translate-x-6" : "translate-x-0"
                }`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
