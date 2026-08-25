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
};

export type ServiceFaq = {
  question: string;
  answer: string;
};
