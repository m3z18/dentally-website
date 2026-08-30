import "server-only";

import { cache } from "react";

import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { PublicDoctor } from "@/types/doctor";

export type { PublicDoctor } from "@/types/doctor";

type PublicDoctorsResult = {
  doctors: PublicDoctor[];
  unavailable: boolean;
};

const publicDoctorFields = [
  "id",
  "slug",
  "name_ar",
  "professional_title_ar",
  "specialty_ar",
  "short_bio_ar",
  "bio_ar",
  "qualifications_ar",
  "expertise_ar",
  "languages_ar",
  "image_path",
  "image_alt_ar",
].join(", ");

export const getPublicDoctors = cache(async (limit = 100): Promise<PublicDoctorsResult> => {
  if (!hasSupabasePublicEnv()) return { doctors: [], unavailable: true };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("doctors")
    .select(publicDoctorFields)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order")
    .order("name_ar")
    .limit(Math.min(Math.max(limit, 1), 100));

  return {
    doctors: error ? [] : (data as unknown as PublicDoctor[]),
    unavailable: Boolean(error),
  };
});

export const getPublicDoctorBySlug = cache(async (slug: string): Promise<PublicDoctor | null> => {
  if (!hasSupabasePublicEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("doctors")
    .select(publicDoctorFields)
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  return error ? null : (data as unknown as PublicDoctor | null);
});
