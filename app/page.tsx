import { BookingCta } from "@/components/home/booking-cta";
import { ArticlesPreview } from "@/components/home/articles-preview";
import { ContactPreview } from "@/components/home/contact-preview";
import { DoctorsPreview } from "@/components/home/doctors-preview";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { HeroSection } from "@/components/home/hero-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { ServicesPreview } from "@/components/home/services-preview";
import { StorySection } from "@/components/home/story-section";
import { WhyDentally } from "@/components/home/why-dentally";
import { OffersPreview } from "@/components/home/offers-preview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <WhyDentally />
      <DoctorsPreview />
      <ArticlesPreview />
      <OffersPreview />
      <StorySection />
      <GalleryPreview />
      <ReviewsSection />
      <BookingCta />
      <ContactPreview />
    </>
  );
}
