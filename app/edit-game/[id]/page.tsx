"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MoveLeft, Loader2 } from "lucide-react";
import GameDetailsStep from "@/components/upload/GameDetailsStep";
import FilesStep from "@/components/upload/FilesStep";
import ContactLinksStep from "@/components/upload/ContactLinksStep";
import ImageUploadsStep from "@/components/upload/ImageUploadsStep";
import UploadDoneModal from "@/components/ui/UploadDoneModal";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { GameFormData } from "@/app/upload-game/page";
import { Id } from "@/convex/_generated/dataModel";

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as Id<"games">;
  
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 4;

  const updateGame = useMutation(api.games.updateGame);
  const getGame = useQuery(api.games.getGame, gameId ? { id: gameId } : "skip");
  const dbUser = useQuery(api.users.getUserByEmail, user?.email ? { email: user.email } : "skip");

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

  // Populate data when game is fetched
  useEffect(() => {
    if (getGame) {
      setFormData({
        title: getGame.title,
        location: getGame.location || "",
        category: getGame.tagline || "", // Using tagline as category
        description: getGame.description || "",
        trailerUrl: getGame.trailerUrl || "",
        logoStorageId: getGame.logoImage || undefined,
        coverStorageId: getGame.coverImage || undefined,
        socials: getGame.socials || {},
        snapshots: getGame.snapshots || [],
      });
      setIsLoading(false);
    } else if (getGame === null) {
      setIsLoading(false); // Stop loading if game is null (not found)
    }
  }, [getGame]);

  // ... rest of the code ...

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (getGame === null) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white">
           <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
           <button onClick={() => router.push('/profile')} className="text-primary hover:underline">
             Go to Profile
           </button>
        </div>
     );
  }

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
      await updateGame({
        id: gameId,
        title: formData.title,
        description: formData.description,
        coverImage: formData.coverStorageId,
        logoImage: formData.logoStorageId,
        trailerUrl: formData.trailerUrl,
        location: formData.location,
        socials: formData.socials,
        snapshots: formData.snapshots,
        tagline: formData.category,
      });

      setIsDoneModalOpen(true);
    } catch (error) {
      console.error("Failed to update game:", error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

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

      <h1 className="text-xl text-white/40 font-dm-sans mb-8">Edit Game</h1>

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
