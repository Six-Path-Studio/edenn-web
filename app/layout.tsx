import type { Metadata } from "next";
import { Mulish, Preahvihear, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

const preahvihear = Preahvihear({
  weight: "400",
  variable: "--font-preahvihear",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const powerGrotesk = localFont({
  src: "./fonts/PowerGrotesk-Regular.ttf",
  variable: "--font-power",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Eden",
  description: "Connect with world-class game development studios, indie creators, and gaming professionals. Find services, hire talent, or showcase your portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${mulish.variable} ${preahvihear.variable} ${dmSans.variable} ${powerGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
