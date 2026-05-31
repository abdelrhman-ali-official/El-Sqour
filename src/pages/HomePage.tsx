import Hero from "../sections/Hero";
import StatsStrip from "../sections/StatsStrip";
import PopularDestinations from "../sections/PopularDestinations";
import CarsSection from "../sections/CarsSection";
import WhyChooseUs from "../sections/WhyChooseUs";
import TestimonialsSection from "../sections/TestimonialsSection";
import MobileAppSection from "../sections/MobileAppSection";
import ContactSection from "../sections/ContactSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <PopularDestinations />
      <CarsSection />
      <WhyChooseUs />
      <TestimonialsSection />
      <MobileAppSection />
      <ContactSection />
    </>
  );
}
