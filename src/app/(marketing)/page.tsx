import { Hero } from "@/components/landing/hero";
import { StudioInfo } from "@/components/landing/studio-info";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AboutSection } from "@/components/landing/about-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StudioInfo />
      <HowItWorks />
      <AboutSection />
    </>
  );
}
