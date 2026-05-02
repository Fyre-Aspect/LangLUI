import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DemoSection } from "@/components/sections/DemoSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <DemoSection />
        <FeaturesSection />
        <RoadmapSection />
      </main>
      <Footer />
    </>
  );
}
