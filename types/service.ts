export type DentalService = {
  id: string;
  title: string;
  slug: string;
  featured: boolean;
  description: string;
  intro: string;
  procedures: string[];
  needIndicators: string[];
  visitExpectations: string[];
  faq: ServiceFaq[];
  titleEn?: string;
  descriptionEn?: string;
  introEn?: string;
  bookingEnabled?: boolean;
  imageUrl?: string | null;
  imageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};
