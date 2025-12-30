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
      } as any); // Cast to any to allow use_fedcm_for_prompt
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
    <div className="sign-in-step">
      {/* Google Identity Services Script */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        onLoad={() => setGoogleScriptLoaded(true)}
      />

      {/* Show email if authenticated */}
      {isAuthenticated && user && (
        <div className="auth-success">
          <CheckCircle size={20} className="text-green-500" />
          <span>Signed in as <strong>{user.email}</strong></span>
        </div>
      )}

      <h1 className="title">Sign in to Edenn</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!googleClientId && (
        <div className="warning-message">
          Google Sign-In is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file.
        </div>
      )}

      <div className="social-buttons">
        {/* Custom Google Sign-In Button */}
        {googleClientId ? (
          <button
            className="social-button google"
            onClick={() => {
              if (window.google && googleScriptLoaded) {
                window.google.accounts.id.prompt();
              }
            }}
            disabled={isLoading || isAuthenticated}
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
            {isLoading && <Loader2 className="animate-spin ml-auto" size={18} />}
          </button>
        ) : (
          <button className="social-button disabled" disabled>
            <GoogleIcon />
            <span>Google Sign-In not configured</span>
          </button>
        )}

        <button
          className="social-button coming-soon"
          onClick={() => handleUnavailableProvider("Facebook")}
          disabled={isLoading || isAuthenticated}
        >
          <FacebookIcon />
          <div className="button-text-wrapper">
            <span>Sign up using Facebook</span>
            <span className="coming-soon-badge">Coming soon</span>
          </div>
        </button>

        <button
          className="social-button coming-soon"
          onClick={() => handleUnavailableProvider("Apple")}
          disabled={isLoading || isAuthenticated}
        >
          <AppleIcon />
          <div className="button-text-wrapper">
            <span>Sign up using Apple</span>
            <span className="coming-soon-badge">Coming soon</span>
          </div>
        </button>
      </div>

      <style jsx>{`
        .button-text-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .coming-soon-badge {
          font-size: 10px;
          text-transform: uppercase;
          background: rgba(118, 40, 219, 0.2);
          color: #9b4dff;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .social-button.coming-soon {
          opacity: 0.8;
        }
        .sign-in-step {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 380px;
        }

        .auth-success {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          width: 100%;
        }

        .title {
          font-family: var(--font-preahvihear), serif;
          font-weight: 400;
          font-size: 42px;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 48px;
          letter-spacing: -0.5px;
        }

        .error-message {
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.3);
          color: #ff3b30;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          width: 100%;
        }

        .warning-message {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          color: #ffc107;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          width: 100%;
        }

        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .social-button {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: 1px solid var(--input-border);
          border-radius: 12px;
          color: #ffffff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .social-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .social-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .sign-in-step {
            align-items: center;
            text-align: center;
          }

          .title {
            font-size: 32px;
            margin-bottom: 32px;
          }

          .social-button {
            padding: 14px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
