import { BookingCta } from "@/components/home/booking-cta";
import { ContactPreview } from "@/components/home/contact-preview";
import { FacilityGallery } from "@/components/home/facility-gallery";
import { HeroSection } from "@/components/home/hero-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { ServicesPreview } from "@/components/home/services-preview";
import { StorySection } from "@/components/home/story-section";
import { WhyDentally } from "@/components/home/why-dentally";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <WhyDentally />
      <StorySection />
      <FacilityGallery />
      <ReviewsSection />
      <BookingCta />
      <ContactPreview />
    </>
  );
}
