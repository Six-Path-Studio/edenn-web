"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/components/providers/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Pages that definitely shouldn't have the standard navbar
  const noNavbarRoutes = ["/signin", "/signup", "/onboarding"];
  const showNavbar = !noNavbarRoutes.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar isLoggedIn={isAuthenticated} />}
      {children}
    </>
  );
}
