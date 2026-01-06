import Hero from "@/components/landing/Hero";
import FeaturedSection from "@/components/landing/FeaturedSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-white overflow-x-hidden">
      <Hero />
      <FeaturedSection />
    </main>
  );
}
