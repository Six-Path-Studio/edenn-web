"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  id: Id<"users"> | string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
  googleClientId: string;
  handleGoogleCredentialResponse: (response: GoogleCredentialResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Google OAuth Configuration - Only Client ID is needed (no secret for client-side)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Type definitions for Google Sign In
export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleUserPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

// Helper to decode JWT
function decodeJwt(token: string): GoogleUserPayload {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storeUser = useMutation(api.auth.storeUser);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("edenn_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("edenn_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Handle Google credential response (called when user signs in via embedded button)
  const handleGoogleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      // Decode JWT token to get user info
      const payload = decodeJwt(response.credential);
      
      // Store in Convex
      const userId = await storeUser({
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        provider: "google",
        providerId: payload.sub,
      });

      const newUser: User = {
        id: userId,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      };

      setUser(newUser);
      localStorage.setItem("edenn_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  }, [storeUser]);

  const signOut = () => {
    setUser(null);
    // Clear all auth-related localStorage
    localStorage.removeItem("edenn_user");
    localStorage.removeItem("edenn_onboarding_completed");
    // Disable Google auto-select and revoke session
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
      // Revoke the current session completely
      if (user?.email) {
        window.google.accounts.id.revoke(user.email, () => {
          console.log("Google session revoked");
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      signOut,
      googleClientId: GOOGLE_CLIENT_ID,
      handleGoogleCredentialResponse,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Declare global Google types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { 
            client_id: string; 
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            theme?: string;
            size?: string;
            text?: string;
            shape?: string;
            width?: number;
          }) => void;
          prompt: (moment_callback?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}
