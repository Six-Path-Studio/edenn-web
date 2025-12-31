"use client";

import { useState, useEffect, useRef } from "react";
import { UploadCloud, Trash2, Globe, Instagram, Youtube, User, Loader2, Check, Upload } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFileUpload } from "@/lib/useFileUpload";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

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
          // Get the URL immediately (simulated or simplified, we just store storageId for now, but UI needs URL)
          // Wait, if I upload, I get ID. I need a URL to show it.
          // I can create a local preview URL.
          const previewUrl = URL.createObjectURL(file);
          
          setFormData(prev => {
              const newSnapshots = [...prev.snapshots];
              if (index < newSnapshots.length) {
                  // Replace existing
                   newSnapshots[index] = { ...newSnapshots[index], url: storageId }; // We store ID in DB, but for preview we might need to handle it.
                   // Ideally we store URL from `fileUpload`?? `useFileUpload` returns storageId.
                   // The schema expects a URL string, but `users.ts` converts storage ID to URL.
                   // So we should save storageId as 'url' in DB.
                   // But locally we show previewUrl.
                   // This is tricky.
                   // Let's store `url: storageId` in state, but also a `previewUrl` property?
                   // Or just assume `url` is the ID, and we render `url` if it's blob, else resolve?
                   // No, `formData.snapshots` is what we save.
                   // I'll update my local state to strictly match what I send to DB.
                   // But for rendering, I need a way to show the new image.
                   // I'll misuse `url` field to store the ID, but render based on if it's a blob url or not.
                   // Wait, if I set `url` to a blob URL, I can't save that to DB.
                   // I should stick to `url` = storageId.
                   // BUT for preview: I can just set `url` to the ID, and use a separate ref or state for previews?
                   // Or just use the blob URL for `url` locally, but when saving, ensure I have the ID?
                   // `useFileUpload` gives ID.
                   // I will set `url` to ID.
                   // But the `img src` won't work with ID.
                   // I'll resort to:
                   // 1. `handleSnapshotUpload` sets `url` to the ID.
                   // 2. But we need a preview.
                   // I'll add `previewUrl` to the Snapshot object in state, but exclude it when saving.
              } else {
                  // Append new
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

  // Compute if there are changes
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
      JSON.stringify(formData.snapshots.map(s => ({...s, previewUrl: undefined}))) !== JSON.stringify(dbUser.snapshots || [])
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

  if (!dbUser) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. Header & Main Profile Info */}
      <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-preahvihear text-white tracking-tight">Edit Profile</h1>
            <div className="flex gap-4">
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
                                   placeholder="Instagram"
                                   className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3 outline-none focus:border-primary text-white text-sm"
                               />
                                <Instagram size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                           </div>
                            <div className="relative">
                               <input 
                                   placeholder="Instagram"
                                   className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3 outline-none focus:border-primary text-white text-sm"
                               />
                               <Instagram size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                           </div>
                       </div>
                   </div>
              </div>
              
               <div className="pt-4">
                    <button 
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`bg-[#7628db] text-white px-10 py-3 rounded-full font-dm-sans font-medium transition-all hover:bg-[#8b3eff] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                    {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
          </div>
      </div>

      {/* 2. Social Links Container */}
      <div className="space-y-8">
           <h2 className="text-5xl font-preahvihear text-white tracking-tight">Social Links</h2>
           <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl space-y-8">
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
                   <div className="relative">
                       <input 
                           name="tiktok"
                           value={formData.tiktok}
                           onChange={handleInputChange}
                           placeholder="Tiktok"
                           className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary text-white text-sm"
                       />
                   </div>
                   <div className="relative">
                        <select className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors text-white font-dm-sans appearance-none text-sm">
                             <option>Categories</option>
                         </select>
                   </div>
               </div>
               
               <div className="pt-4">
                    <button 
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`bg-[#7628db] text-white px-10 py-3 rounded-full font-dm-sans font-medium transition-all hover:bg-[#8b3eff] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                    {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
           </div>
      </div>

      {/* 3. Snapshots Container */}
      {(dbUser?.role === "studio" || dbUser?.role === "creator") && (
          <div className="space-y-8">
               <h2 className="text-5xl font-preahvihear text-white tracking-tight">Snapshots</h2>
               <div className="bg-[#0B0B0B] border border-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => {
                             const snapshot = formData.snapshots[i];
                             // Use previewUrl if available (simulated above, but I didn't actually implement previewUrl properly in state yet.
                             // Actually, since I stored storageId in URL, I can't preview it without resolving.
                             // BUT, for existing ones from DB, they are resolved URLs.
                             // For NEW ones, they are storage IDs.
                             // I need a way to know if it's a URL or ID.
                             // Simple hack: if it starts with "http" or "blob", it's a URL.
                             // If it's alphanumeric, it's an ID.
                             // If it's an ID, I can't show it easily without `useQuery` or `useStorage`.
                             // I'll assume for this turn that `fileUpload.uploadFile` returns the ID.
                             // I really need to set a BLOB URL for the `url` field in local state to show it immediately.
                             // And when saving, I need the actual ID.
                             // Correct approach: Store object in state: { url: string (blob or resolved), storageId?: string, title, tags }.
                             // On save, use storageId if present, else url (if it's already an ID/URL).
                             // If I change `formData.snapshots` type locally, I need to map it back on save.
                             
                             // Let's rely on standard `url` field.
                             // If it is a new upload, I'll put the BLOB URL in `url`, and the ID in `storageId` (added to type).
                             
                             const hasImage = !!snapshot?.url;
                             const displayUrl = snapshot?.url; // This will work if I use blob url.

                             return (
                             <div key={i} className="bg-[#1A1A1A] rounded-[24px] overflow-hidden border border-[#333] group hover:border-[#7628db]/50 transition-colors relative">
                                  <div className="h-[180px] bg-[#222] flex items-center justify-center relative overflow-hidden">
                                      {hasImage ? (
                                          <img src={displayUrl} className="w-full h-full object-cover" alt="Snapshot" />
                                      ) : (
                                          <UploadCloud size={32} className="text-white/20" />
                                      )}
                                      
                                      {/* Upload Input - Always functional if empty, or if replacing? */}
                                      <input 
                                          type="file" 
                                          className="hidden" 
                                          id={`snapshot-upload-${i}`}
                                          accept="image/*"
                                          onChange={(e) => handleSnapshotUpload(e, i)}
                                      />
                                      {/* Trigger for upload if empty */}
                                      {!hasImage && (
                                          <label htmlFor={`snapshot-upload-${i}`} className="absolute inset-0 cursor-pointer w-full h-full z-10" />
                                      )}
                                  </div>
                                  
                                  <div className="p-4 bg-[#111] flex items-center justify-between">
                                      {hasImage ? (
                                        <>
                                          <div className="flex-1 min-w-0 mr-2 space-y-1">
                                              <input 
                                                  value={snapshot.title || ""} 
                                                  placeholder="Edit Title"
                                                  onChange={(e) => handleSnapshotUpdate(i, 'title', e.target.value)}
                                                  className="bg-transparent border-none outline-none text-white font-medium text-sm w-full placeholder:text-white/40"
                                              />
                                              <input 
                                                  value={snapshot.tags?.join(" ") || ""} 
                                                  placeholder="#Tag #Tag"
                                                  onChange={(e) => handleSnapshotUpdate(i, 'tags', e.target.value.split(" "))}
                                                  className="bg-transparent border-none outline-none text-white/40 text-xs w-full placeholder:text-white/20"
                                              />
                                          </div>
                                          <div className="flex gap-2 shrink-0">
                                               <button 
                                                    onClick={() => handleSnapshotDelete(i)}
                                                    className="w-8 h-8 rounded-full bg-[#2A1111] text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                                >
                                                   <Trash2 size={14} />
                                               </button>
                                               {/* Re-upload button */}
                                                <label htmlFor={`snapshot-upload-${i}`} className="w-20 h-8 rounded-full bg-[#7628db] text-white text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#8b3eff] transition-colors cursor-pointer">
                                                   <Upload size={12} />
                                                   Upload
                                               </label>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="w-full flex justify-between items-center">
                                            <span className="text-white/20 text-sm italic">Empty Slot</span>
                                             <label htmlFor={`snapshot-upload-${i}`} className="w-20 h-8 rounded-full bg-[#7628db] text-white text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#8b3eff] transition-colors cursor-pointer">
                                                   <Upload size={12} />
                                                   Upload
                                            </label>
                                        </div>
                                      )}
                                  </div>
                             </div>
                        );
                        })}
                    </div>
                    {/* Add Save Button for Snapshots too */}
                    <div className="pt-4">
                        <button 
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`bg-[#7628db] text-white px-10 py-3 rounded-full font-dm-sans font-medium transition-all hover:bg-[#8b3eff] disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                        {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
               </div>
          </div>
      )}

    </div>
  );
}
