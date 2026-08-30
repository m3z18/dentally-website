import type { Database } from "@/types/database";

export type DoctorRow = Database["public"]["Tables"]["doctors"]["Row"];
export type DoctorInsert = Database["public"]["Tables"]["doctors"]["Insert"];
export type DoctorUpdate = Database["public"]["Tables"]["doctors"]["Update"];

export type PublicDoctor = Pick<
  DoctorRow,
  | "id"
  | "slug"
  | "name_ar"
  | "professional_title_ar"
  | "specialty_ar"
  | "short_bio_ar"
  | "bio_ar"
  | "qualifications_ar"
  | "expertise_ar"
  | "languages_ar"
  | "image_path"
  | "image_alt_ar"
>;
