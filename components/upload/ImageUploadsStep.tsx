"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useFileUpload } from "@/lib/useFileUpload";
import { GameFormData } from "@/app/upload-game/page";

interface ImageUploadsStepProps {
  onFinish: () => void;
  onBack: () => void;
  onSkip: () => void;
  formData: GameFormData;
  updateData: (data: Partial<GameFormData>) => void;
  isSubmitting: boolean;
}

interface SnapshotUpload {
  id: number;
  storageId: string | null;
  preview: string | null;
  isUploading: boolean;
}

export default function ImageUploadsStep({ onFinish, onSkip, formData, updateData, isSubmitting }: ImageUploadsStepProps) {
  // Initialize from formData
  const [snapshots, setSnapshots] = useState<SnapshotUpload[]>(() => {
    const initial: SnapshotUpload[] = [];
    for (let i = 0; i < 6; i++) {
      initial.push({
        id: i + 1,
        storageId: formData.snapshots[i] || null,
        preview: null, // We can't easily restore preview without fetching url, that's okay for now
        isUploading: false
      });
    }
    return initial;
  });

  const fileUpload = useFileUpload();

  // Sync snapshots state back to formData whenever storageIds change
  useEffect(() => {
    const validSnapshots = snapshots
      .map(s => s.storageId)
      .filter((id): id is string => id !== null);
    
    // Only update if different to avoid loop
    if (JSON.stringify(validSnapshots) !== JSON.stringify(formData.snapshots)) {
      updateData({ snapshots: validSnapshots });
    }
  }, [snapshots, updateData, formData.snapshots]);

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set loading state
    setSnapshots(prev => prev.map((s, i) => 
      i === index ? { ...s, isUploading: true } : s
    ));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSnapshots(prev => prev.map((s, i) => 
        i === index ? { ...s, preview: reader.result as string } : s
      ));
    };
    reader.readAsDataURL(file);

    try {
      // Upload to Convex
      const storageId = await fileUpload.uploadFile(file);
      setSnapshots(prev => prev.map((s, i) => 
        i === index ? { ...s, storageId, isUploading: false } : s
      ));
    } catch {
      setSnapshots(prev => prev.map((s, i) => 
        i === index ? { ...s, isUploading: false } : s
      ));
    }
  };

  const clearSnapshot = (index: number) => {
    setSnapshots(prev => prev.map((s, i) => 
      i === index ? { ...s, storageId: null, preview: null } : s
    ));
  };

  const isAnyUploading = snapshots.some(s => s.isUploading);
  const uploadedCount = snapshots.filter(s => s.storageId).length;

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-preahvihear mb-4 text-center">
        Image Uploads
      </h1>
      <p className="text-white/40 font-dm-sans mb-12 text-center">
        {uploadedCount}/6 snapshots uploaded
      </p>

      <div className="w-full space-y-3">
        {snapshots.map((snapshot, index) => (
          <label key={snapshot.id} className="w-full block cursor-pointer group">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileChange(index, e)}
              disabled={snapshot.isUploading}
            />
            <div className={`w-full bg-[#1a1a1a] border border-transparent rounded-xl px-5 py-4 flex justify-between items-center group-hover:bg-[#222] group-hover:border-white/10 transition-all ${snapshot.storageId ? 'border-green-500/20' : ''}`}>
              <div className="flex items-center gap-4">
                {snapshot.preview ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                    <Image src={snapshot.preview} alt={`Snapshot ${snapshot.id}`} fill className="object-cover" />
                  </div>
                ) : null}
                <span className={snapshot.storageId ? "text-green-400 font-dm-sans" : "text-white/40 font-dm-sans"}>
                  Snapshots {snapshot.id} {snapshot.storageId && "✓"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {snapshot.storageId && (
                  <button 
                    onClick={(e) => { e.preventDefault(); clearSnapshot(index); }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={16} className="text-white/40" />
                  </button>
                )}
                {snapshot.isUploading ? (
                  <Loader2 size={20} className="animate-spin text-primary" />
                ) : snapshot.storageId ? (
                  <Check size={20} className="text-green-400" />
                ) : (
                  <UploadCloud size={20} className="text-white/40 group-hover:text-primary transition-colors" />
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-12 w-full flex items-center justify-between gap-6">
        <button 
          onClick={onFinish}
          disabled={isAnyUploading || isSubmitting}
          className="flex-1 bg-primary hover:bg-[#8b3eff] text-white py-3.5 rounded-full font-dm-sans font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Submitting...
            </>
          ) : isAnyUploading ? (
            "Uploading..."
          ) : (
            "Finish"
          )}
        </button>
        <button 
          onClick={onSkip}
          disabled={isAnyUploading || isSubmitting}
          className="flex-1 bg-[#333] hover:bg-[#444] text-white py-3.5 rounded-full font-dm-sans font-semibold transition-all active:scale-95 disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
