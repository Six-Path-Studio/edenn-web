"use client";

import { useState } from "react";
import { BackArrowIcon } from "@/components/icons";

interface SocialLinksStepProps {
  onNext: () => void;
  onBack: () => void;
  initialData?: any;
  updateData?: (data: any) => void;
}

interface SocialLinks {
  instagram: string;
  tiktok: string;
  twitter: string;
  youtube: string;
  twitch: string;
}

export default function SocialLinksStep({ onNext, onBack, initialData, updateData }: SocialLinksStepProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: initialData?.instagram || "",
    tiktok: initialData?.tiktok || "",
    twitter: initialData?.twitter || "",
    youtube: initialData?.youtube || "",
    twitch: initialData?.twitch || "",
  });

  const handleInputChange = (field: keyof SocialLinks, value: string) => {
    const newLinks = { ...socialLinks, [field]: value };
    setSocialLinks(newLinks);
    updateData?.(newLinks);
  };

  const hasAnyLink = Object.values(socialLinks).some((link) => link.trim() !== "");

  return (
    <div className="social-links-step">
      <button className="go-back-button" onClick={onBack}>
        <BackArrowIcon className="back-icon" />
        <span>Go Back</span>
      </button>

      <h1 className="title">Contact link</h1>

      <div className="form-fields">
        <div className="input-group">
          <input
            type="text"
            placeholder="Instagram:"
            value={socialLinks.instagram}
            onChange={(e) => handleInputChange("instagram", e.target.value)}
            className="text-input"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Tiktok:"
            value={socialLinks.tiktok}
            onChange={(e) => handleInputChange("tiktok", e.target.value)}
            className="text-input"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Twitter / X:"
            value={socialLinks.twitter}
            onChange={(e) => handleInputChange("twitter", e.target.value)}
            className="text-input"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Youtube:"
            value={socialLinks.youtube}
            onChange={(e) => handleInputChange("youtube", e.target.value)}
            className="text-input"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Twitch:"
            value={socialLinks.twitch}
            onChange={(e) => handleInputChange("twitch", e.target.value)}
            className="text-input"
          />
        </div>
      </div>

      <div className="button-group">
        <button
          className={`proceed-button ${hasAnyLink ? "active" : ""}`}
          onClick={onNext}
        >
          Proceed
        </button>

        <button className="skip-button" onClick={onNext}>
          Skip
        </button>
      </div>

      <style jsx>{`
        .social-links-step {
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

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          margin-bottom: 32px;
        }

        .input-group {
          position: relative;
          width: 100%;
        }

        .text-input {
          width: 100%;
          padding: 18px 20px;
          background: transparent;
          border: 1px solid var(--input-border);
          border-radius: 12px;
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .text-input:focus {
          border-color: var(--primary);
        }

        .text-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .button-group {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .proceed-button {
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

        .proceed-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(118, 40, 219, 0.5);
        }

        .skip-button {
          padding: 16px 48px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 30px;
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .skip-button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 768px) {
          .social-links-step {
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

          .text-input {
            padding: 14px 16px;
            font-size: 14px;
          }

          .button-group {
            flex-direction: column;
            width: 100%;
            gap: 16px;
          }

          .proceed-button,
          .skip-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
