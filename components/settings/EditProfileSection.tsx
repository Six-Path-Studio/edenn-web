"use client";

import { useState, useEffect, useRef } from "react";
import { UploadCloud, Trash2, Globe, Instagram, Youtube, User, Loader2, Check, Upload } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFileUpload } from "@/lib/useFileUpload";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { toast } from "sonner"; // Added toast import

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
    linkedin: "",
    portfolio: "",
    snapshots: [] as Array<{ url: string; title?: string; tags?: string[] }>,
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
        linkedin: dbUser.socials?.linkedin || "",
        portfolio: dbUser.socials?.portfolio || "",
        snapshots: dbUser.snapshots || [],
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
      toast.error(`${type === 'avatar' ? 'Avatar' : 'Cover'} upload failed`);
    }
  };

  const handleSnapshotUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const storageId = await fileUpload.uploadFile(file);
          setFormData(prev => {
              const newSnapshots = [...prev.snapshots];
              if (index < newSnapshots.length) {
                   newSnapshots[index] = { ...newSnapshots[index], url: storageId }; 
              } else {
                  newSnapshots.push({ url: storageId, title: "Untitled", tags: [] });
              }
              return { ...prev, snapshots: newSnapshots };
          });
      } catch (error) {
          toast.error("Snapshot upload failed");
      }
  };

  const handleSnapshotDelete = (index: number) => {
      setFormData(prev => ({
          ...prev,
          snapshots: prev.snapshots.filter((_, i) => i !== index)
      }));
  };

  const handleSnapshotUpdate = (index: number, field: 'title' | 'tags', value: any) => {
      setFormData(prev => {
          const newSnapshots = [...prev.snapshots];
          if (newSnapshots[index]) {
              newSnapshots[index] = { ...newSnapshots[index], [field]: value };
          }
          return { ...prev, snapshots: newSnapshots };
      });
  };

  const hasChanges = dbUser ? (
      formData.name !== (dbUser.name || "") ||
      formData.bio !== (dbUser.bio || "") ||
      formData.location !== (dbUser.location || "") ||
      formData.tiktok !== (dbUser.socials?.tiktok || "") ||
      formData.youtube !== (dbUser.socials?.youtube || "") ||
      formData.twitter !== (dbUser.socials?.twitter || "") ||
      formData.instagram !== (dbUser.socials?.instagram || "") ||
      formData.twitch !== (dbUser.socials?.twitch || "") ||
      formData.linkedin !== (dbUser.socials?.linkedin || "") ||
      formData.portfolio !== (dbUser.socials?.portfolio || "") ||
      JSON.stringify(formData.snapshots) !== JSON.stringify(dbUser.snapshots || [])
  ) : false;

  const handleSave = async () => {
    if (!dbUser?._id || !hasChanges) return;
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
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
        },
        snapshots: formData.snapshots.map(s => ({
            url: s.url,
            title: s.title,
            tags: s.tags,
        }))
      });
      setIsSuccess(true);
      toast.success("Profile saved successfully!");
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSnapshotItem = (i: number) => {
    const snapshot = formData.snapshots[i];
    const hasImage = !!snapshot?.url;
    const displayUrl = snapshot?.url;

    return (
      <div key={i} className="bg-[#111] rounded-[24px] overflow-hidden border border-white/5 group hover:border-[#7628db]/50 transition-all duration-300 relative shadow-lg">
           <div className="h-[200px] bg-[#1A1A1A] flex items-center justify-center relative overflow-hidden">
               {hasImage ? (
                   <img src={displayUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Snapshot" />
               ) : (
                   <div className="flex flex-col items-center gap-2 opacity-20">
                    <UploadCloud size={40} />
                    <span className="text-xs font-bold uppercase tracking-widest">Empty Slot</span>
                   </div>
               )}
               
               <input 
                   type="file" 
                   className="hidden" 
                   id={`snapshot-upload-${i}`}
                   accept="image/*"
                   onChange={(e) => handleSnapshotUpload(e, i)}
               />
               {!hasImage && (
                   <label htmlFor={`snapshot-upload-${i}`} className="absolute inset-0 cursor-pointer w-full h-full z-10" />
               )}
           </div>
           
           <div className="p-5 bg-[#0B0B0B] flex flex-col gap-3">
               {hasImage ? (
                 <>
                   <div className="space-y-2">
                       <input 
                           value={snapshot.title || ""} 
                           placeholder="Enter Title"
                           onChange={(e) => handleSnapshotUpdate(i, 'title', e.target.value)}
                           className="bg-transparent border-none outline-none text-white font-bold text-sm w-full placeholder:text-white/20 focus:placeholder:text-white/40"
                       />
                       <input 
                           value={snapshot.tags?.join(" ") || ""} 
                           placeholder="#Gaming #UnrealEngine"
                           onChange={(e) => handleSnapshotUpdate(i, 'tags', e.target.value.split(" "))}
                           className="bg-transparent border-none outline-none text-[#7628DB] text-xs w-full placeholder:text-white/10"
                       />
                   </div>
                   <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button 
                             onClick={() => handleSnapshotDelete(i)}
                             className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                         >
                            <Trash2 size={14} /> Delete
                        </button>
                         <label htmlFor={`snapshot-upload-${i}`} className="flex-1 py-2 rounded-xl bg-white/5 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                            <Upload size={14} /> Replace
                        </label>
                   </div>
                 </>
               ) : (
                 <label htmlFor={`snapshot-upload-${i}`} className="w-full py-4 rounded-2xl bg-[#7628db] text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8b3eff] transition-all cursor-pointer shadow-[0_8px_20px_rgba(118,40,219,0.3)]">
                    <UploadCloud size={16} />
                    Upload Image
                 </label>
               )}
           </div>
      </div>
    );
  };

  const renderSnapshotGrid = () => {
    return Array.from({ length: 6 }).map((_, i) => renderSnapshotItem(i));
  };

  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. Header & Main Profile Info */}
      <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <h1 className="text-3xl md:text-5xl font-preahvihear text-white tracking-tight">Edit Profile</h1>
            <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => {
                      if (dbUser?._id) {
                          const url = `${window.location.origin}/profile/${dbUser._id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Profile link copied!");
                      }
                  }}
                  className="px-6 py-2 border border-white/20 rounded-full text-white font-dm-sans text-sm hover:bg-white/5 transition-all flex items-center gap-2"
                >
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

          <div className="bg-[#0B0B0B] border border-white/5 rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-2xl space-y-8">
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

              {/* Row 2: Names */}
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

              {/* Row 5: Cover Photo & Featured Video (Youtube + Insta + Insta style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                   <div className="space-y-3">
                      <h3 className="text-white font-dm-sans font-medium opacity-60">Featured Video:</h3>
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
                                   name="tiktok"
                                   value={formData.tiktok}
                                   onChange={handleInputChange}
                                   placeholder="TikTok Link:"
                                   className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3 outline-none focus:border-primary text-white text-sm"
                               />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold uppercase">TikTok</div>
                           </div>
                           <div className="relative">
                               <input 
                                   name="twitch"
                                   value={formData.twitch}
                                   onChange={handleInputChange}
                                   placeholder="Twitch Stream Link:"
                                   className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3 outline-none focus:border-primary text-white text-sm"
                               />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold uppercase">Twitch</div>
                           </div>
                       </div>
                   </div>
              </div>
          </div>
      </div>

      {/* 2. Social Links Container */}
      <div className="space-y-8">
           <h2 className="text-3xl md:text-5xl font-preahvihear text-white tracking-tight">Social Links</h2>
           <div className="bg-[#0B0B0B] border border-white/5 rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-2xl space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="relative">
                       <input 
                           name="portfolio"
                           value={formData.portfolio}
                           onChange={handleInputChange}
                           placeholder="Portfolio Link:"
                           className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary text-white text-sm"
                       />
                       <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                   </div>
                   <div className="relative">
                       <input 
                           name="instagram"
                           value={formData.instagram}
                           onChange={handleInputChange}
                           placeholder="Instagram"
                           className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary text-white text-sm"
                       />
                        <Instagram size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                   </div>
                   <div className="relative">
                       <input 
                           name="twitter"
                           value={formData.twitter}
                           onChange={handleInputChange}
                           placeholder="X"
                           className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary text-white text-sm"
                       />
                   </div>
                   <div className="relative">
                        <input 
                           name="linkedin"
                           value={formData.linkedin}
                           onChange={handleInputChange}
                           placeholder="Linkedin"
                           className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary text-white text-sm"
                       />
                   </div>
               </div>
           </div>
      </div>

      {/* 3. Snapshots Container */}
      {(dbUser?.role === "studio" || dbUser?.role === "creator") && (
          <div className="space-y-8">
               <h2 className="text-3xl md:text-5xl font-preahvihear text-white tracking-tight">Snapshots</h2>
               <div className="bg-[#0B0B0B] border border-white/5 rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-2xl">
                    
                    {/* Desktop Grid */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {renderSnapshotGrid()}
                    </div>

                    {/* Mobile Swiper */}
                    <div className="md:hidden">
                        <Swiper
                            spaceBetween={16}
                            slidesPerView={1.2}
                            className="w-full pb-8"
                        >
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SwiperSlide key={i} className="py-2">
                                    {renderSnapshotItem(i)}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Unified Save Button */}
                    <div className="pt-10 flex flex-col items-center border-t border-white/5 mt-6">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className={`w-full max-w-md py-5 rounded-[24px] font-dm-sans font-black text-sm uppercase tracking-[0.2em] transition-all bg-[#7628db] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(118,40,219,0.2)]`}
                        >
                            {isSaving ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Updating Profile...
                                </div>
                            ) : "Save Settings"}
                        </motion.button>
                        <p className="mt-4 text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">
                            Global Cloud Sync Enabled
                        </p>
                    </div>
               </div>
          </div>
      )}

    </div>
  );
}
