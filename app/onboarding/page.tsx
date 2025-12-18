"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  OnboardingSlider,
  StepProgress,
  SignInStep,
  ChooseCategoryStep,
  PersonalDetailsStep,
  SocialLinksStep,
  DisplaySettingsStep,
} from "@/components/onboarding";

import { useRouter } from "next/navigation";

// Define master state type
interface MasterFormData {
  userType: "studio" | "creator" | null;
  studioName?: string;
  username: string;
  country: string;
  career: string;
  about: string;
  socials: Record<string, string>;
  profileImage?: string;
  coverImage?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Master State
  const [formData, setFormData] = useState<MasterFormData>({
    userType: null,
    studioName: "",
    username: "",
    country: "",
    career: "",
    about: "",
    socials: {},
    profileImage: undefined,
    coverImage: undefined,
  });

  const updateFormData = (data: Partial<MasterFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    // Save to localStorage for simulation
    console.log("Onboarding completed!", formData);
    localStorage.setItem("edenn_user_profile", JSON.stringify(formData));
    router.push("/profile");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SignInStep onNext={goToNextStep} />;
      case 2:
        return (
          <ChooseCategoryStep 
            onNext={goToNextStep} 
            onBack={goToPreviousStep}
            onSelectCategory={(type) => updateFormData({ userType: type })} 
          />
        );
      case 3:
        return (
          <PersonalDetailsStep 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
            userType={formData.userType}
            initialData={formData}
            updateData={updateFormData}
          />
        );
      case 4:
        return (
          <SocialLinksStep 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
            updateData={(socials) => updateFormData({ socials })}
          />
        );
      case 5:
        return (
          <DisplaySettingsStep 
            onFinish={handleFinish} 
            onBack={goToPreviousStep}
            updateData={updateFormData} 
          />
        );
      default:
        return <SignInStep onNext={goToNextStep} />;
    }
  };

  return (
    <div className="onboarding-page">
      {/* Left Side - Slider */}
      <div className="slider-section">
        <OnboardingSlider currentStep={currentStep} />
      </div>

      {/* Right Side - Form Content */}
      <div className="content-section">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="step-content"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <style jsx>{`
        .onboarding-page {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--background);
          padding: 0;
          gap: 0;
        }

        .slider-section {
          width: 45%;
          flex-shrink: 0;
          height: 100%;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content-section {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 40px;
          padding-left: 144px;
          overflow-y: auto;
        }

        .step-content {
          width: 100%;
          max-width: 480px;
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .onboarding-page {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }

          .slider-section {
            width: 100%;
            height: 40vh;
            padding: 16px;
            flex: none;
          }

          .content-section {
            width: 100%;
            flex: 1;
            padding: 24px;
            padding-left: 24px; /* Reset padding for mobile */
            justify-content: flex-start;
            align-items: center; /* Center content on mobile if desired, or keep flex-start */
          }
        }
      `}</style>
    </div>
  );
}
