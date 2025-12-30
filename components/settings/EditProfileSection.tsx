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
      {/* 1. Edit Profile Container */}
      <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-preahvihear text-white tracking-tight">Edit Profile</h1>
          <div className="flex gap-4">
            <Link 
              href="/profile"
              className="px-6 py-2 bg-[#7628db] rounded-full text-white font-dm-sans text-sm hover:bg-[#8b3eff] transition-all shadow-lg flex items-center gap-2"
            >
              View Profile
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col gap-8">
          {/* Avatar Upload */}
          <div className="flex items-center gap-8">
            <div 
              className="w-32 h-32 rounded-full overflow-hidden bg-[#111] border-2 border-white/10 relative group cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <User size={40} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <UploadCloud size={24} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Profile Photo</h3>
              <p className="text-white/40 text-sm mb-3">Upload a new profile picture. Recommended size: 400x400px.</p>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="text-primary text-sm font-medium hover:underline"
              >
                Change Photo
              </button>
            </div>
            <input 
              ref={avatarInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleImageUpload(e, 'avatar')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/60 text-sm ml-2">Display Name</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                type="text" 
                placeholder="Ex: Dirty Monkey Studios" 
                className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm ml-2">Location</label>
              <input 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                type="text" 
                placeholder="Ex: Lagos, Nigeria" 
                className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-white/60 text-sm ml-2">Bio / About</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself or your studio..." 
                rows={4} 
                className="w-full bg-[#111] border border-[#222] rounded-[24px] px-6 py-5 outline-none focus:border-primary transition-colors text-white font-dm-sans resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="mt-10 space-y-4">
          <h3 className="text-white font-dm-sans font-medium opacity-60">Cover Photo</h3>
          <div 
            className="w-full h-48 rounded-[32px] bg-[#111] border border-dashed border-[#333] flex flex-col items-center justify-center gap-3 hover:bg-[#161616] transition-all cursor-pointer relative overflow-hidden group"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <UploadCloud size={40} className="text-white/20" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
              <p className="text-white text-sm font-medium">Change Cover Image</p>
            </div>
          </div>
          <input 
            ref={coverInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleImageUpload(e, 'cover')}
          />
        </div>
      </div>

      {/* 2. Social Links Container */}
      <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl">
        <h2 className="text-4xl font-preahvihear text-white mb-10">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-white/60 text-sm ml-2">Instagram</label>
            <input 
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              type="text" 
              placeholder="Username or URL" 
              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/60 text-sm ml-2">TikTok</label>
            <input 
              name="tiktok"
              value={formData.tiktok}
              onChange={handleInputChange}
              type="text" 
              placeholder="Username or URL" 
              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/60 text-sm ml-2">X (Twitter)</label>
            <input 
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              type="text" 
              placeholder="Username or URL" 
              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/60 text-sm ml-2">YouTube</label>
            <input 
              name="youtube"
              value={formData.youtube}
              onChange={handleInputChange}
              type="text" 
              placeholder="Channel URL" 
              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/60 text-sm ml-2">Twitch</label>
            <input 
              name="twitch"
              value={formData.twitch}
              onChange={handleInputChange}
              type="text" 
              placeholder="Channel URL" 
              className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans" 
            />
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-3 px-8 py-4 rounded-full font-dm-sans font-bold transition-all shadow-2xl ${
            isSuccess 
              ? "bg-green-600 text-white" 
              : "bg-primary hover:bg-[#8b3eff] text-white"
          }`}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : isSuccess ? (
            <Check size={20} />
          ) : (
            <Upload size={20} />
          )}
          {isSaving ? "Saving..." : isSuccess ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
