"use client";

import { useState } from "react";
import { BackArrowIcon } from "@/components/icons";
import { ChevronDown } from "lucide-react";

import { Building2 } from "lucide-react";

interface PersonalDetailsStepProps {
  onNext: () => void;
  onBack: () => void;
  userType?: "studio" | "creator" | null;
  initialData?: any;
  updateData?: (data: any) => void;
}

interface FormData {
  studioName?: string;
  username: string;
  country: string;
  career: string;
  about: string;
}

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "Australia",
  "Brazil",
  "Nigeria",
  "India",
];

const careers = [
  "Game Developer",
  "3D Artist",
  "Game Designer",
  "Sound Designer",
  "UI/UX Designer",
  "Producer",
  "QA Tester",
  "Marketing",
  "Community Manager",
  "Other",
];

export default function PersonalDetailsStep({ onNext, onBack, userType, initialData, updateData }: PersonalDetailsStepProps) {
  const [formData, setFormData] = useState<FormData>({
    studioName: initialData?.studioName || "",
    username: initialData?.username || "",
    country: initialData?.country || "",
    career: initialData?.career || "",
    about: initialData?.about || "",
  });

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateData?.(newData);
  };

  const isFormValid = userType === "studio" 
    ? formData.studioName && formData.username && formData.country 
    : formData.username && formData.country && formData.career;

  const handleProceed = () => {
    if (isFormValid) {
      updateData?.(formData);
      onNext();
    }
  };

  return (
    <div className="personal-details-step">
      <button className="go-back-button" onClick={onBack}>
        <BackArrowIcon className="back-icon" />
        <span>Go Back</span>
      </button>

      <h1 className="title">{userType === "studio" ? "Studio Details" : "Personal Details"}</h1>

      <div className="form-fields">
        {userType === "studio" && (
          <div className="input-group">
            <input
              type="text"
              placeholder="Studio Name"
              value={formData.studioName}
              onChange={(e) => handleInputChange("studioName", e.target.value)}
              className="text-input"
            />
            <span className="input-icon no-background">
              <Building2 className="w-5 h-5 opacity-40" />
            </span>
          </div>
        )}

        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            className="text-input"
          />
          <span className="input-icon">@</span>
        </div>

        <div className="select-group">
          <div
            className="select-trigger"
            onClick={() => {
              setShowCountryDropdown(!showCountryDropdown);
              setShowCareerDropdown(false);
            }}
          >
            <span className={formData.country ? "selected" : "placeholder"}>
              {formData.country || "Choose Country"}
            </span>
            <ChevronDown size={20} className="chevron-icon" />
          </div>
          {showCountryDropdown && (
            <div className="dropdown">
              {countries.map((country) => (
                <div
                  key={country}
                  className="dropdown-item"
                  onClick={() => {
                    handleInputChange("country", country);
                    setShowCountryDropdown(false);
                  }}
                >
                  {country}
                </div>
              ))}
            </div>
          )}
        </div>

        {userType !== "studio" && (
          <div className="select-group">
            <div
              className="select-trigger"
              onClick={() => {
                setShowCareerDropdown(!showCareerDropdown);
                setShowCountryDropdown(false);
              }}
            >
              <span className={formData.career ? "selected" : "placeholder"}>
                {formData.career || "Choose Career"}
              </span>
              <ChevronDown size={20} className="chevron-icon" />
            </div>
            {showCareerDropdown && (
              <div className="dropdown">
                {careers.map((career) => (
                  <div
                    key={career}
                    className="dropdown-item"
                    onClick={() => {
                      handleInputChange("career", career);
                      setShowCareerDropdown(false);
                    }}
                  >
                    {career}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea
          placeholder={userType === "studio" ? "About studio" : "About you"}
          value={formData.about}
          onChange={(e) => handleInputChange("about", e.target.value)}
          className="textarea-input"
          rows={4}
        />
      </div>

      <button
        className={`proceed-button ${isFormValid ? "active" : ""}`}
        onClick={handleProceed}
        disabled={!isFormValid}
      >
        Proceed
      </button>

      <style jsx>{`
        .personal-details-step {
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
          gap: 20px;
          width: 100%;
          margin-bottom: 32px;
        }

        .input-group {
          position: relative;
          width: 100%;
        }

        .text-input {
          width: 100%;
          padding: 18px 50px 18px 20px;
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

        .input-icon {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          font-size: 16px;
        }

        .select-group {
          position: relative;
          width: 100%;
        }

        .select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 18px 20px;
          background: transparent;
          border: 1px solid var(--input-border);
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .select-trigger:hover {
          border-color: rgba(255, 255, 255, 0.4);
        }

        .select-trigger .placeholder {
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
        }

        .select-trigger .selected {
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #1a1a1a;
          border: 1px solid var(--input-border);
          border-radius: 12px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
        }

        .dropdown-item {
          padding: 14px 20px;
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .dropdown-item:hover {
          background: rgba(118, 40, 219, 0.2);
        }

        .dropdown-item:first-child {
          border-radius: 11px 11px 0 0;
        }

        .dropdown-item:last-child {
          border-radius: 0 0 11px 11px;
        }

        .textarea-input {
          width: 100%;
          padding: 18px 20px;
          background: transparent;
          border: 1px solid var(--input-border);
          border-radius: 12px;
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          outline: none;
          resize: none;
          transition: border-color 0.3s ease;
        }

        .textarea-input:focus {
          border-color: var(--primary);
        }

        .textarea-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .proceed-button {
          padding: 16px 48px;
          background: rgba(118, 40, 219, 0.5);
          border: none;
          border-radius: 30px;
          color: rgba(255, 255, 255, 0.5);
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: not-allowed;
          transition: all 0.3s ease;
        }

        .proceed-button.active {
          background: linear-gradient(135deg, #7628db 0%, #9b4dff 100%);
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(118, 40, 219, 0.4);
        }

        .proceed-button.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(118, 40, 219, 0.5);
        }

        @media (max-width: 768px) {
          .personal-details-step {
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

          .text-input,
          .select-trigger,
          .textarea-input {
            padding: 14px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
