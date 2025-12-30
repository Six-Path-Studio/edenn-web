"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UseFileUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Step 1: Get a short-lived upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload the file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      setProgress(100);
      
      options?.onSuccess?.(storageId);
      return storageId;
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
  };
}

// Helper component for file input with preview
export function useImagePreview() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearPreview = () => setPreview(null);

  return {
    preview,
    handleFileSelect,
    clearPreview,
  };
}
