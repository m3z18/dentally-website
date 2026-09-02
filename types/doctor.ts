import type { Database } from "@/types/database";

export type DoctorRow = Database["public"]["Tables"]["doctors"]["Row"];
export type DoctorInsert = Database["public"]["Tables"]["doctors"]["Insert"];
export type DoctorUpdate = Database["public"]["Tables"]["doctors"]["Update"];

export type PublicDoctor = Pick<
  DoctorRow,
  | "id"
  | "slug"
  | "name_ar"
  | "name_en"
  | "professional_title_ar"
  | "professional_title_en"
  | "specialty_ar"
  | "specialty_en"
  | "short_bio_ar"
  | "short_bio_en"
  | "bio_ar"
  | "bio_en"
  | "qualifications_ar"
  | "qualifications_en"
  | "expertise_ar"
  | "expertise_en"
  | "languages_ar"
  | "languages_en"
  | "image_path"
  | "image_alt_ar"
  | "image_alt_en"
>;
