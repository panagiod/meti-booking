import { Hero } from "@/components/landing/hero";
import { Categories } from "@/components/landing/categories";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTAAdvisor } from "@/components/landing/cta-advisor";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <HowItWorks />
      <CTAAdvisor />
    </>
  );
}
