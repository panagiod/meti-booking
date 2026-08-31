import { Hero } from "@/components/landing/hero";
import { SessionTypes } from "@/components/landing/session-types";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StudioInfo } from "@/components/landing/studio-info";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="sessions">
        <SessionTypes />
      </div>
      <HowItWorks />
      <StudioInfo />
    </>
  );
}
