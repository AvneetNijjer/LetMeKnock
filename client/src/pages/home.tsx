import HeroSection from "@/components/home/hero-section";
import SearchSection from "@/components/home/search-section";
import FeaturedProperties from "@/components/home/featured-properties";
import ServicesSection from "@/components/home/services-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CtaSection from "@/components/home/cta-section";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Prefetch featured properties
  useQuery({
    queryKey: ['/api/properties/featured'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="min-h-screen">
      <HeroSection />
      <SearchSection />
      <ServicesSection />
      <FeaturedProperties />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
