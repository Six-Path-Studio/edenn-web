"use client";

import { GoogleIcon, FacebookIcon, AppleIcon } from "@/components/icons";

interface SignInStepProps {
  onNext: () => void;
}

export default function SignInStep({ onNext }: SignInStepProps) {
  const handleSocialSignIn = (provider: string) => {
    console.log(`Signing in with ${provider}`);
    // Simulate sign in - in real app, this would handle OAuth
    onNext();
  };

  return (
    <div className="sign-in-step">
      <h1 className="title">Sign in to Edenn</h1>

      <div className="social-buttons">
        <button
          className="social-button"
          onClick={() => handleSocialSignIn("google")}
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>

        <button
          className="social-button"
          onClick={() => handleSocialSignIn("facebook")}
        >
          <FacebookIcon />
          <span>Sign up using Facebook</span>
        </button>

        <button
          className="social-button"
          onClick={() => handleSocialSignIn("apple")}
        >
          <AppleIcon />
          <span>Sign up using Apple</span>
        </button>
      </div>

      <style jsx>{`
        .sign-in-step {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 380px;
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

        .social-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
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
