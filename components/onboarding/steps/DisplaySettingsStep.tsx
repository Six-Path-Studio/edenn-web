"use client";

import { useState, useRef } from "react";
import { BackArrowIcon } from "@/components/icons";
import { Upload, CloudUpload, Loader2, Check } from "lucide-react";
import { useFileUpload } from "@/lib/useFileUpload";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface DisplaySettingsStepProps {
  onFinish: () => void;
  onBack: () => void;
  updateData?: (data: { profileImage?: string; coverImage?: string }) => void;
}

export default function DisplaySettingsStep({ onFinish, onBack, updateData }: DisplaySettingsStepProps) {
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [coverPicture, setCoverPicture] = useState<string | null>(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [profileStorageId, setProfileStorageId] = useState<string | null>(null);
  const [coverStorageId, setCoverStorageId] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fileUpload = useFileUpload();
  const updateUser = useMutation(api.users.updateUser);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setProfilePicture(previewUrl);
    setProfileUploading(true);

    try {
      // Upload to Convex storage
      const storageId = await fileUpload.uploadFile(file);
      setProfileStorageId(storageId);
      
      // If user is authenticated, save to their profile
      if (user?.id) {
        await updateUser({ 
          id: user.id as Id<"users">, 
          avatar: storageId
        });
      }
      
      updateData?.({ profileImage: storageId });
    } catch (error) {
      console.error("Profile upload failed:", error);
    } finally {
      setProfileUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setCoverPicture(previewUrl);
    setCoverUploading(true);

    try {
      // Upload to Convex storage
      const storageId = await fileUpload.uploadFile(file);
      setCoverStorageId(storageId);

      // If user is authenticated, save to their profile
      if (user?.id) {
        await updateUser({ 
          id: user.id as Id<"users">, 
          coverImage: storageId
        });
      }

      updateData?.({ coverImage: storageId });
    } catch (error) {
      console.error("Cover upload failed:", error);
    } finally {
      setCoverUploading(false);
    }
  };

  const isUploading = profileUploading || coverUploading;

  return (
    <div className="display-settings-step">
      <button className="go-back-button" onClick={onBack}>
        <BackArrowIcon className="back-icon" />
        <span>Go Back</span>
      </button>

      <h1 className="title">Display settings</h1>

      <div className="upload-sections">
        <div className="upload-row">
          <span className="upload-label">Upload Profile Picture</span>
          <div
            className={`profile-upload-button ${profilePicture ? "has-image" : ""}`}
            onClick={() => !profileUploading && profileInputRef.current?.click()}
            style={profilePicture ? { backgroundImage: `url(${profilePicture})` } : {}}
          >
            {profileUploading ? (
              <div className="upload-status">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : profileStorageId ? (
              <div className="upload-status success">
                <Check size={24} />
              </div>
            ) : !profilePicture && (
              <div className="upload-icon-wrapper">
                <CloudUpload size={24} />
              </div>
            )}
          </div>
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileUpload}
            style={{ display: "none" }}
          />
        </div>

        <div className="cover-upload-section">
          <span className="upload-label">Upload Cover Picture</span>
          <div
            className={`cover-upload-area ${coverPicture ? "has-image" : ""}`}
            onClick={() => !coverUploading && coverInputRef.current?.click()}
            style={coverPicture ? { backgroundImage: `url(${coverPicture})` } : {}}
          >
            {coverUploading ? (
              <div className="cover-upload-icon uploading">
                <Loader2 size={32} className="animate-spin" />
              </div>
            ) : coverStorageId ? (
              <div className="cover-upload-icon success">
                <Check size={32} />
              </div>
            ) : !coverPicture && (
              <div className="cover-upload-icon">
                <Upload size={32} />
              </div>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <button 
        className="finish-button" 
        onClick={onFinish}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Finish"}
      </button>

      <style jsx>{`
        .display-settings-step {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 420px;
        }

        .go-back-button {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 32px;
          padding: 0;
          transition: opacity 0.3s ease;
        }

        .go-back-button:hover {
          opacity: 0.8;
        }

        .title {
          font-family: var(--font-preahvihear), serif;
          font-weight: 400;
          font-size: 42px;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 40px;
          letter-spacing: -0.5px;
        }

        .upload-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          margin-bottom: 32px;
        }

        .upload-row {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .upload-label {
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.8);
        }

        .profile-upload-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2dd4bf 0%, #7628db 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .profile-upload-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(45, 212, 191, 0.3);
        }

        .profile-upload-button.has-image {
          border: 3px solid var(--primary);
        }

        .upload-icon-wrapper {
          color: #ffffff;
        }

        .upload-status {
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .upload-status.success {
          background: rgba(34, 197, 94, 0.8);
        }

        .cover-upload-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cover-upload-area {
          width: 100%;
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px dashed var(--input-border);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-size: cover;
          background-position: center;
        }

        .cover-upload-area:hover {
          border-color: var(--primary);
          background-color: rgba(118, 40, 219, 0.1);
        }

        .cover-upload-area.has-image {
          border-style: solid;
          border-color: var(--primary);
        }

        .cover-upload-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .cover-upload-icon.uploading {
          color: var(--primary);
        }

        .cover-upload-icon.success {
          background: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .finish-button {
          padding: 16px 48px;
          background: linear-gradient(135deg, #7628db 0%, #9b4dff 100%);
          border: none;
          border-radius: 30px;
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(118, 40, 219, 0.4);
        }

        .finish-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(118, 40, 219, 0.5);
        }

        .finish-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .display-settings-step {
            align-items: center;
          }

          .go-back-button {
            align-self: flex-start;
          }

          .title {
            font-size: 32px;
            text-align: center;
            margin-bottom: 32px;
          }

          .upload-row {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .finish-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
