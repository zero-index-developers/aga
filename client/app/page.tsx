import { HeroSection } from "@client/components/landing/hero-section";
import { FeaturesSection } from "@client/components/landing/features-section";
import { CTASection } from "@client/components/landing/cta-section";
import { SmoothScrollProvider } from "@client/components/smooth-scroll-provider";

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </SmoothScrollProvider>
  );
}
