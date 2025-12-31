"use client";

import { useState, useEffect, useRef } from "react";
import { UploadCloud, Trash2, Globe, Instagram, Youtube, User, Loader2, Check, Upload } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFileUpload } from "@/lib/useFileUpload";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

export default function EditProfileSection() {
  const { user } = useAuth();
  const dbUser = useQuery(api.users.getUserByEmail, user?.email ? { email: user.email } : "skip");
  const updateUser = useMutation(api.users.updateUser);
  const fileUpload = useFileUpload();

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    tiktok: "",
    youtube: "",
    twitter: "",
    instagram: "",
    twitch: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || "",
        bio: dbUser.bio || "",
        location: dbUser.location || "",
        tiktok: dbUser.socials?.tiktok || "",
        youtube: dbUser.socials?.youtube || "",
        twitter: dbUser.socials?.twitter || "",
        instagram: dbUser.socials?.instagram || "",
        twitch: dbUser.socials?.twitch || "",
      });
      if (dbUser.avatar) setAvatarPreview(dbUser.avatar);
      if (dbUser.coverImage) setCoverPreview(dbUser.coverImage);
    }
  }, [dbUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === 'avatar') setAvatarPreview(previewUrl);
    else setCoverPreview(previewUrl);

    try {
      const storageId = await fileUpload.uploadFile(file);
      if (dbUser?._id) {
        await updateUser({
          id: dbUser._id as Id<"users">,
          [type === 'avatar' ? 'avatar' : 'coverImage']: storageId
        });
      }
    } catch (error) {
      console.error(`${type} upload failed:`, error);
    }
  };

  const handleSave = async () => {
    if (!dbUser?._id) return;
    setIsSaving(true);
    setIsSuccess(false);
    try {
      await updateUser({
        id: dbUser._id,
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        socials: {
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          twitter: formData.twitter,
          instagram: formData.instagram,
          twitch: formData.twitch,
        }
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!dbUser) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* 1. Edit Profile Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-preahvihear text-white tracking-tight">Edit Profile</h1>
        <div className="flex gap-4">
            <button className="px-6 py-2 border border-white/20 rounded-full text-white font-dm-sans text-sm hover:bg-white/5 transition-all flex items-center gap-2">
                <Globe size={16} /> Share Link
            </button>
            <Link 
            href="/profile"
            className="px-6 py-2 bg-[#7628db] rounded-full text-white font-dm-sans text-sm hover:bg-[#8b3eff] transition-all shadow-lg flex items-center gap-2"
            >
            View Profile
            </Link>
        </div>
      </div>

      <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl space-y-8">
          {/* Row 1: Email & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <input 
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-[#1A1A1A] border border-[#222] rounded-xl px-5 py-4 text-white/50 font-dm-sans cursor-not-allowed" 
                    placeholder="Email Address"
                />
            </div>
            <div className="space-y-2">
                <input 
                    value={formData.name.toLowerCase().replace(/\s/g, '')}
                    readOnly
                    className="w-full bg-[#1A1A1A] border border-[#222] rounded-xl px-5 py-4 text-white/50 font-dm-sans" 
                    placeholder="Username"
                />
            </div>
          </div>

          {/* Row 2: Names (Simulated split for UI, combined for DB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
                    placeholder="First Name / Display Name"
                />
            </div>
            <div className="space-y-2">
                 <input 
                    disabled
                    placeholder="Last Name"
                    className="w-full bg-[#1A1A1A] border border-[#222] rounded-xl px-5 py-4 text-white/50 font-dm-sans cursor-not-allowed" 
                />
            </div>
          </div>

           {/* Row 3: Location & Categories */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <input 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
                    placeholder="Location"
                />
            </div>
            <div className="space-y-2">
                 <select className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans appearance-none">
                     <option>Categories</option>
                     <option>Game Dev</option>
                     <option>Artist</option>
                 </select>
            </div>
          </div>

          {/* Row 4: About */}
          <div className="space-y-2">
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="About Game / Bio" 
                rows={6} 
                className="w-full bg-[#111] border border-[#222] rounded-[24px] px-6 py-5 outline-none focus:border-primary transition-colors text-white font-dm-sans resize-none" 
              />
          </div>

          {/* Row 5: Cover Photo & Featured Video/Socials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Cover Photo */}
              <div className="space-y-3">
                  <h3 className="text-white font-dm-sans font-medium opacity-60">Cover Photo</h3>
                   <div 
                        className="w-full h-[240px] rounded-[32px] bg-[#1A1A1A] border border-dashed border-[#333] flex flex-col items-center justify-center gap-3 hover:bg-[#222] transition-all cursor-pointer relative overflow-hidden group"
                        onClick={() => coverInputRef.current?.click()}
                    >
                        {coverPreview ? (
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                        <UploadCloud size={40} className="text-white/20" />
                        )}
                        <input 
                            ref={coverInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'cover')}
                        />
                    </div>
              </div>

               {/* Right: Socials */}
               <div className="space-y-3">
                  <h3 className="text-white font-dm-sans font-medium opacity-60">Featured Video / Socials:</h3>
                   <div className="space-y-4">
                       <div className="relative">
                           <input 
                              name="youtube"
                              value={formData.youtube}
                              onChange={handleInputChange}
                              placeholder="Youtube Trailer:"
                              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3 outline-none focus:border-primary text-white text-sm"
                           />
                           <Youtube size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                       </div>
                       <div className="relative">
                           <input 
                              name="instagram"
                              value={formData.instagram}
                              onChange={handleInputChange}
                              placeholder="Instagram"
                              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3 outline-none focus:border-primary text-white text-sm"
                           />
                            <Instagram size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                       </div>
                        <div className="relative">
                           <input 
                              name="tiktok"
                              value={formData.tiktok}
                              onChange={handleInputChange}
                              placeholder="TikTok"
                              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3 outline-none focus:border-primary text-white text-sm"
                           />
                       </div>
                   </div>
               </div>
          </div>
          
           {/* Save Button Inline */}
            <div className="pt-4">
                <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`bg-[#7628db] text-white px-10 py-3 rounded-full font-dm-sans font-medium transition-all hover:bg-[#8b3eff] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                {isSaving ? "Saving..." : "Save"}
                </button>
            </div>
      </div>

    </div>
  );
}
