"use client";

import { useState, useEffect } from "react";
import { GoogleIcon, FacebookIcon, AppleIcon } from "@/components/icons";
import { useAuth, GoogleCredentialResponse } from "@/components/providers/AuthProvider";
import { Loader2, CheckCircle } from "lucide-react";
import Script from "next/script";

interface SignInStepProps {
  onNext: () => void;
}

export default function SignInStep({ onNext }: SignInStepProps) {
  const { user, isAuthenticated, googleClientId, handleGoogleCredentialResponse } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Initialize Google Identity Services when script loads
  useEffect(() => {
    if (googleScriptLoaded && googleClientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        use_fedcm_for_prompt: false,
        ux_mode: "popup",
        callback: async (response: GoogleCredentialResponse) => {
          setIsLoading(true);
          setError(null);
          try {
            await handleGoogleCredentialResponse(response);
          } catch (err) {
            setError("Sign in failed. Please try again.");
            setIsLoading(false);
          }
        },
      } as any);

      // Render the actual Google button into a hidden container
      // This is often more reliable on mobile than just calling prompt()
      const googleBtnRoot = document.getElementById("google-button-hidden");
      if (googleBtnRoot) {
        window.google.accounts.id.renderButton(googleBtnRoot, {
          theme: "outline",
          size: "large",
          width: 400, // Matches our max-w
          text: "signin_with",
          shape: "rectangular"
        });
      }
    }
  }, [googleScriptLoaded, googleClientId, handleGoogleCredentialResponse]);



  // When user becomes authenticated, advance to next step
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(false);
      // Small delay so user sees their email before advancing
      const timer = setTimeout(() => {
        onNext();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, onNext]);

  const handleUnavailableProvider = (provider: string) => {
    setError(`${provider} sign-in is coming soon!`);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[400px] text-center mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Google Identity Services Script */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        onLoad={() => setGoogleScriptLoaded(true)}
      />

      {/* Show email if authenticated */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-xl mb-6 text-sm w-full justify-center">
          <CheckCircle size={18} />
          <span>Signed in as <strong>{user.email}</strong></span>
        </div>
      )}

      <h1 className="text-5xl font-preahvihear text-white mb-4 tracking-tight">Sign in to Edenn</h1>
      <p className="text-white/50 font-dm-sans text-sm mb-10 leading-relaxed max-w-[320px]">
        Skip the hassle of building from scratch. Get a fully functional AI agent asap
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm w-full">
          {error}
        </div>
      )}

      {!googleClientId && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-3 rounded-xl mb-6 text-sm w-full">
          Google Sign-In is not configured.
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {/* Google Button */}
        <div className="relative w-full">
          <button
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#111] border border-[#222] hover:bg-[#1A1A1A] hover:border-[#333] transition-all rounded-2xl text-white font-dm-sans font-medium text-sm group"
            disabled={isLoading || isAuthenticated || !googleClientId}
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
            {isLoading && <Loader2 className="animate-spin ml-auto text-white/50" size={16} />}
          </button>
          
          {/* Overlay real Google button for absolute reliability on mobile */}
          <div 
            id="google-button-hidden" 
            className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden"
          ></div>
        </div>

        {/* Facebook Button */}
        <button
          className="flex items-center justify-center gap-3 w-full py-4 bg-[#111] border border-[#222] hover:bg-[#1A1A1A] hover:border-[#333] transition-all rounded-2xl text-white font-dm-sans font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          onClick={() => handleUnavailableProvider("Facebook")}
          disabled={isLoading || isAuthenticated}
        >
          <FacebookIcon />
          <span>Sign up using Facebook</span>
        </button>

        {/* Apple Button */}
        <button
          className="flex items-center justify-center gap-3 w-full py-4 bg-[#111] border border-[#222] hover:bg-[#1A1A1A] hover:border-[#333] transition-all rounded-2xl text-white font-dm-sans font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          onClick={() => handleUnavailableProvider("Apple")}
          disabled={isLoading || isAuthenticated}
        >
          <AppleIcon />
          <span>Sign up using Apple</span>
        </button>
      </div>
    </div>
  );
}
