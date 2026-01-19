"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import GameDetailsStep from "@/components/upload/GameDetailsStep";
import FilesStep from "@/components/upload/FilesStep";
import ContactLinksStep from "@/components/upload/ContactLinksStep";
import ImageUploadsStep from "@/components/upload/ImageUploadsStep";
import UploadDoneModal from "@/components/ui/UploadDoneModal";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";

export interface GameFormData {
  title: string;
  location: string;
  category: string;
  description: string;
  trailerUrl: string;
  logoStorageId: string | undefined;
  coverStorageId: string | undefined;
  socials: Record<string, string>;
  snapshots: string[];
}

export default function UploadGamePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const createGame = useMutation(api.games.createGame);
  const dbUser = useQuery(api.users.getUserByEmail, user?.email ? { email: user.email } : "skip");
  
  // Role check: Only studios can upload games
  if (dbUser && dbUser.role === "creator") {
    router.push("/");
    return null;
  }

  const [formData, setFormData] = useState<GameFormData>({
    title: "",
    location: "",
    category: "",
    description: "",
    trailerUrl: "",
    logoStorageId: undefined,
    coverStorageId: undefined,
    socials: {},
    snapshots: [],
  });

  const updateFormData = (data: Partial<GameFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleGoBack = () => {
    if (step === 1) {
      router.back();
    } else {
      prevStep();
    }
  };

  const handleFinish = async () => {
    if (!dbUser) return;
    setIsSubmitting(true);

    try {
      await createGame({
        title: formData.title,
        description: formData.description,
        coverImage: formData.coverStorageId,
        logoImage: formData.logoStorageId,
        trailerUrl: formData.trailerUrl,
        location: formData.location,
        socials: formData.socials,
        snapshots: formData.snapshots,
        // Default values
        tagline: formData.category, // Using category as tagline for now or could be separate
      });

      setIsDoneModalOpen(true);
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <GameDetailsStep onNext={nextStep} onBack={handleGoBack} formData={formData} updateData={updateFormData} />;
      case 2:
        return <FilesStep onNext={nextStep} onBack={prevStep} formData={formData} updateData={updateFormData} />;
      case 3:
        return <ContactLinksStep onNext={nextStep} onBack={prevStep} onSkip={nextStep} formData={formData} updateData={updateFormData} />;
      case 4:
        return <ImageUploadsStep onFinish={handleFinish} onBack={prevStep} onSkip={handleFinish} formData={formData} updateData={updateFormData} isSubmitting={isSubmitting} />;
      default:
        return <GameDetailsStep onNext={nextStep} onBack={handleGoBack} formData={formData} updateData={updateFormData} />;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-center mb-16">
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors cursor-pointer"
        >
          <MoveLeft size={20} />
          <span className="font-dm-sans">{step === 1 ? "Exit" : "Go Back"}</span>
        </button>
      </div>

      {/* Hero Section / Content */}
      <div className="w-full max-w-xl flex-1 flex flex-col items-center">
        {renderStep()}
      </div>

      {/* Step Indicator */}
      <div className="w-full max-w-xl mt-12 flex justify-center items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              s === step ? "w-12 bg-primary" : "w-4 bg-[#3c3c3c]"
            }`}
          />
        ))}
      </div>

      {/* Done Modal */}
      <UploadDoneModal 
        isOpen={isDoneModalOpen} 
        onClose={() => {
          setIsDoneModalOpen(false);
          router.push("/profile");
        }} 
      />
    </main>
  );
}
