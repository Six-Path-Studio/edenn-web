"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  OnboardingSlider,
  SignInStep,
} from "@/components/onboarding";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function SignInPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is already onboarded
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );
  
  // Redirect already onboarded users to profile or home
  useEffect(() => {
    if (isAuthenticated && dbUser) {
        if (dbUser.onboarded) {
            router.push("/profile");
        } else {
            router.push("/onboarding");
        }
    }
  }, [dbUser, isAuthenticated, router]);

  const handleNext = () => {
    // This is called when SignInStep succeeds
    // The useEffect above will handle redirection
  };

  return (
    <div className="signin-page">
      {/* Left Side - Slider */}
      <div className="slider-section">
        <OnboardingSlider currentStep={1} />
      </div>

      {/* Right Side - Form Content */}
      <div className="content-section">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="step-content"
          >
            <SignInStep onNext={handleNext} />
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
        .signin-page {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #000;
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
          .signin-page {
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
            padding-left: 24px;
            justify-content: flex-start;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
