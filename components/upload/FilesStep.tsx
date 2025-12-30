"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useFileUpload, useImagePreview } from "@/lib/useFileUpload";
import { GameFormData } from "@/app/upload-game/page";

interface FilesStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: GameFormData;
  updateData: (data: Partial<GameFormData>) => void;
}

export default function FilesStep({ onNext, formData, updateData }: FilesStepProps) {
  // Use local state only for upload status
  const logoUpload = useFileUpload({
    onSuccess: (storageId) => updateData({ logoStorageId: storageId }),
  });
  const logoPreview = useImagePreview();

  const coverUpload = useFileUpload({
    onSuccess: (storageId) => updateData({ coverStorageId: storageId }),
  });
  const coverPreview = useImagePreview();

  // Initialize previews if data exists
  useEffect(() => {
    // Note: We can't hydrate the preview URL from storage ID easily without another fetch
    // So we just rely on if the storageID exists to show "Uploaded" state or maybe fetch the URL if we wanted to be fancy
    // For now, we'll just show the checkmark if ID exists
  }, []);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      logoPreview.handleFileSelect(file);
      await logoUpload.uploadFile(file);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      coverPreview.handleFileSelect(file);
      await coverUpload.uploadFile(file);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-preahvihear mb-16 text-center">
        Files
      </h1>

      <div className="w-full space-y-10">
        {/* Logo Upload */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-dm-sans text-white/80">Upload Game Logo</span>
          <label className="cursor-pointer group relative">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleLogoChange}
              disabled={logoUpload.isUploading}
            />
            <div className={`w-20 h-20 rounded-full bg-linear-to-br from-[#7628db] to-[#4facfe] flex items-center justify-center text-white shadow-[0_0_20px_rgba(118,40,219,0.3)] group-hover:shadow-[0_0_30px_rgba(118,40,219,0.5)] transition-all overflow-hidden ${formData.logoStorageId ? 'border-2 border-green-400' : ''}`}>
              {logoUpload.isUploading ? (
                <Loader2 size={32} className="animate-spin" />
              ) : logoPreview.preview ? (
                <Image src={logoPreview.preview} alt="Logo" fill className="object-cover" />
              ) : formData.logoStorageId ? (
                <Check size={32} className="text-green-400" />
              ) : (
                <UploadCloud size={32} />
              )}
            </div>
          </label>
        </div>

        {/* Cover Picture Upload */}
        <div className="flex flex-col gap-4">
          <span className="text-lg font-dm-sans text-white/80">Upload Game Cover Picture</span>
          <label className="cursor-pointer group">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleCoverChange}
              disabled={coverUpload.isUploading}
            />
            <div className={`w-full h-48 rounded-2xl border-2 border-dashed border-[#333333] bg-[#1a1a1a] group-hover:border-primary/50 group-hover:bg-[#222] transition-all flex flex-col items-center justify-center gap-2 text-white/20 overflow-hidden relative ${formData.coverStorageId ? 'border-green-500/50' : ''}`}>
              {coverUpload.isUploading ? (
                <Loader2 size={48} className="animate-spin text-primary" />
              ) : coverPreview.preview ? (
                <Image src={coverPreview.preview} alt="Cover" fill className="object-cover" />
              ) : formData.coverStorageId ? (
                <Check size={48} className="text-green-400" />
              ) : (
                <UploadCloud size={48} className="text-white/40" />
              )}
            </div>
          </label>
        </div>

        {/* Trailer Input */}
        <div className="pt-4">
          <input 
            type="text" 
            placeholder="Trailer Video: (Youtube only)"
            value={formData.trailerUrl}
            onChange={(e) => updateData({ trailerUrl: e.target.value })}
            className="w-full bg-[#0d0d0d] border border-[#222222] rounded-xl px-5 py-4 outline-none focus:border-primary transition-colors font-dm-sans"
          />
        </div>
      </div>

      <button 
        onClick={onNext}
        disabled={logoUpload.isUploading || coverUpload.isUploading}
        className="mt-16 bg-primary hover:bg-[#8b3eff] text-white px-14 py-3.5 rounded-full font-dm-sans font-semibold transition-all shadow-[0_4px_20px_rgba(118,40,219,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {logoUpload.isUploading || coverUpload.isUploading ? "Uploading..." : "Proceed"}
      </button>
    </div>
  );
}
