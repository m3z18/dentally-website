export type SpecialtyRow = {
  id: string; slug: string; name_ar: string; name_en: string | null;
  description_ar: string | null; description_en: string | null;
  display_order: number; is_active: boolean; deleted_at: string | null;
  created_at: string; updated_at: string;
};

export type BranchRow = {
  id: string; slug: string; name_ar: string; name_en: string | null;
  address_ar: string | null; address_en: string | null; phone: string | null;
  whatsapp: string | null; email: string | null; maps_url: string | null;
  latitude: number | null; longitude: number | null;
  working_hours_ar: string | null; working_hours_en: string | null;
  display_order: number; is_active: boolean; deleted_at: string | null;
  created_at: string; updated_at: string;
};

export type ServiceContentRow = {
  id: string; slug: string; name_ar: string; name_en: string | null;
  description_ar: string | null; description_en: string | null;
  content_ar: string | null; content_en: string | null;
  image_path: string | null; image_alt_ar: string | null; image_alt_en: string | null;
  specialty_id: string | null; display_order: number;
  seo_title_ar: string | null; seo_title_en: string | null;
  seo_description_ar: string | null; seo_description_en: string | null;
  is_active: boolean; is_public: boolean; deleted_at: string | null;
  created_at: string; updated_at: string;
  specialties?: Pick<SpecialtyRow, "slug" | "name_ar" | "name_en"> | null;
};

export type SearchResult = {
  type: "service" | "doctor" | "article";
  title: string;
  description: string;
  href: string;
};
