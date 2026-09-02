export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type AdminRole = "admin" | "receptionist" | "manager" | "doctor";

export type Database = {
  public: {
    Tables: {
      article_categories: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          name_en: string | null;
          description_ar: string | null;
          description_en: string | null;
          display_order: number;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          display_order?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["article_categories"]["Insert"]>;
        Relationships: [];
      };
      article_references: {
        Row: {
          id: string;
          article_id: string;
          title: string;
          url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          title: string;
          url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["article_references"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "article_references_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      articles: {
        Row: {
          id: string;
          slug: string;
          title_ar: string;
          title_en: string | null;
          excerpt_ar: string;
          excerpt_en: string | null;
          content_ar: string;
          content_en: string | null;
          image_path: string | null;
          image_alt_ar: string | null;
          image_alt_en: string | null;
          author_name_ar: string | null;
          author_name_en: string | null;
          author_doctor_id: string | null;
          category_id: string | null;
          is_featured: boolean;
          display_order: number;
          published_at: string | null;
          scheduled_publish_at: string | null;
          scheduled_unpublish_at: string | null;
          is_active: boolean;
          deleted_at: string | null;
          seo_title_ar: string | null;
          seo_title_en: string | null;
          seo_description_ar: string | null;
          seo_description_en: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_ar: string;
          title_en?: string | null;
          excerpt_ar: string;
          excerpt_en?: string | null;
          content_ar: string;
          content_en?: string | null;
          image_path?: string | null;
          image_alt_ar?: string | null;
          image_alt_en?: string | null;
          author_name_ar?: string | null;
          author_name_en?: string | null;
          author_doctor_id?: string | null;
          category_id?: string | null;
          is_featured?: boolean;
          display_order?: number;
          published_at?: string | null;
          scheduled_publish_at?: string | null;
          scheduled_unpublish_at?: string | null;
          is_active?: boolean;
          deleted_at?: string | null;
          seo_title_ar?: string | null;
          seo_title_en?: string | null;
          seo_description_ar?: string | null;
          seo_description_en?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "articles_author_doctor_id_fkey";
            columns: ["author_doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "article_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          booking_reference: string;
          service_id: string;
          appointment_date: string;
          appointment_time: string;
          patient_name: string;
          patient_phone: string;
          notes: string | null;
          status: AppointmentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_reference?: string;
          service_id: string;
          appointment_date: string;
          appointment_time: string;
          patient_name: string;
          patient_phone: string;
          notes?: string | null;
          status?: AppointmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      availability: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          slot_duration_minutes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          slot_duration_minutes: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability"]["Insert"]>;
        Relationships: [];
      };
      blocked_times: {
        Row: {
          id: string;
          block_date: string;
          start_time: string;
          end_time: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          block_date: string;
          start_time: string;
          end_time: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_times"]["Insert"]>;
        Relationships: [];
      };
      doctors: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          name_en: string | null;
          professional_title_ar: string;
          professional_title_en: string | null;
          specialty_ar: string;
          specialty_en: string | null;
          short_bio_ar: string;
          short_bio_en: string | null;
          bio_ar: string | null;
          bio_en: string | null;
          qualifications_ar: string[];
          qualifications_en: string[];
          expertise_ar: string[];
          expertise_en: string[];
          languages_ar: string[];
          languages_en: string[];
          image_path: string | null;
          image_alt_ar: string | null;
          image_alt_en: string | null;
          specialty_id: string | null;
          display_order: number;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          professional_title_ar?: string;
          professional_title_en?: string | null;
          specialty_ar: string;
          specialty_en?: string | null;
          short_bio_ar: string;
          short_bio_en?: string | null;
          bio_ar?: string | null;
          bio_en?: string | null;
          qualifications_ar?: string[];
          qualifications_en?: string[];
          expertise_ar?: string[];
          expertise_en?: string[];
          languages_ar?: string[];
          languages_en?: string[];
          image_path?: string | null;
          image_alt_ar?: string | null;
          image_alt_en?: string | null;
          specialty_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["doctors"]["Insert"]>;
        Relationships: [];
      };
      faq_items: {
        Row: {
          id: string;
          question_ar: string;
          question_en: string | null;
          answer_ar: string;
          answer_en: string | null;
          category: string | null;
          service_id: string | null;
          display_order: number;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_ar: string;
          question_en?: string | null;
          answer_ar: string;
          answer_en?: string | null;
          category?: string | null;
          service_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faq_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "faq_items_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      gallery_items: {
        Row: { id: string; image_path: string; image_alt_ar: string; image_alt_en: string | null; caption_ar: string | null; caption_en: string | null; category: string | null; display_order: number; is_active: boolean; deleted_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; image_path: string; image_alt_ar: string; image_alt_en?: string | null; caption_ar?: string | null; caption_en?: string | null; category?: string | null; display_order?: number; is_active?: boolean; deleted_at?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["gallery_items"]["Insert"]>;
        Relationships: [];
      };
      insurance_providers: {
        Row: { id: string; name_ar: string; name_en: string | null; image_path: string | null; image_alt_ar: string | null; image_alt_en: string | null; website_url: string | null; display_order: number; is_active: boolean; deleted_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name_ar: string; name_en?: string | null; image_path?: string | null; image_alt_ar?: string | null; image_alt_en?: string | null; website_url?: string | null; display_order?: number; is_active?: boolean; deleted_at?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["insurance_providers"]["Insert"]>;
        Relationships: [];
      };
      offers: {
        Row: { id: string; title_ar: string; title_en: string | null; description_ar: string; description_en: string | null; image_path: string | null; image_alt_ar: string | null; image_alt_en: string | null; cta_label_ar: string | null; cta_label_en: string | null; cta_url: string | null; start_at: string | null; end_at: string | null; display_order: number; is_active: boolean; deleted_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; title_ar: string; title_en?: string | null; description_ar: string; description_en?: string | null; image_path?: string | null; image_alt_ar?: string | null; image_alt_en?: string | null; cta_label_ar?: string | null; cta_label_en?: string | null; cta_url?: string | null; start_at?: string | null; end_at?: string | null; display_order?: number; is_active?: boolean; deleted_at?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["offers"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: AdminRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AdminRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          name_en: string | null;
          description_ar: string | null;
          description_en: string | null;
          content_ar: string | null;
          content_en: string | null;
          image_path: string | null;
          image_alt_ar: string | null;
          image_alt_en: string | null;
          specialty_id: string | null;
          display_order: number;
          seo_title_ar: string | null;
          seo_title_en: string | null;
          seo_description_ar: string | null;
          seo_description_en: string | null;
          deleted_at: string | null;
          is_active: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          content_ar?: string | null;
          content_en?: string | null;
          image_path?: string | null;
          image_alt_ar?: string | null;
          image_alt_en?: string | null;
          specialty_id?: string | null;
          display_order?: number;
          seo_title_ar?: string | null;
          seo_title_en?: string | null;
          seo_description_ar?: string | null;
          seo_description_en?: string | null;
          deleted_at?: string | null;
          is_active?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      specialties: {
        Row: { id:string; slug:string; name_ar:string; name_en:string|null; description_ar:string|null; description_en:string|null; display_order:number; is_active:boolean; deleted_at:string|null; created_at:string; updated_at:string };
        Insert: { id?:string; slug:string; name_ar:string; name_en?:string|null; description_ar?:string|null; description_en?:string|null; display_order?:number; is_active?:boolean; deleted_at?:string|null; created_at?:string; updated_at?:string };
        Update: Partial<Database["public"]["Tables"]["specialties"]["Insert"]>; Relationships: [];
      };
      branches: {
        Row: { id:string; slug:string; name_ar:string; name_en:string|null; address_ar:string|null; address_en:string|null; phone:string|null; whatsapp:string|null; email:string|null; maps_url:string|null; latitude:number|null; longitude:number|null; working_hours_ar:string|null; working_hours_en:string|null; display_order:number; is_active:boolean; deleted_at:string|null; created_at:string; updated_at:string };
        Insert: { id?:string; slug:string; name_ar:string; name_en?:string|null; address_ar?:string|null; address_en?:string|null; phone?:string|null; whatsapp?:string|null; email?:string|null; maps_url?:string|null; latitude?:number|null; longitude?:number|null; working_hours_ar?:string|null; working_hours_en?:string|null; display_order?:number; is_active?:boolean; deleted_at?:string|null; created_at?:string; updated_at?:string };
        Update: Partial<Database["public"]["Tables"]["branches"]["Insert"]>; Relationships: [];
      };
      content_redirects: {
        Row: { id:string; entity_type:"doctor"|"article"|"service"; old_slug:string; new_slug:string; created_at:string };
        Insert: { id?:string; entity_type:"doctor"|"article"|"service"; old_slug:string; new_slug:string; created_at?:string };
        Update: Partial<Database["public"]["Tables"]["content_redirects"]["Insert"]>; Relationships: [];
      };
      audit_logs: {
        Row: { id:number; actor_user_id:string|null; action:"create"|"update"|"publish"|"hide"|"soft_delete"|"restore"; entity_type:string; entity_id:string; created_at:string };
        Insert: { actor_user_id?:string|null; action:"create"|"update"|"publish"|"hide"|"soft_delete"|"restore"; entity_type:string; entity_id:string; created_at?:string };
        Update: never; Relationships: [];
      };
      site_settings: {
        Row: {
          id: boolean;
          organization_name_ar: string | null;
          organization_name_en: string | null;
          about_ar: string | null;
          about_en: string | null;
          vision_ar: string | null;
          vision_en: string | null;
          mission_ar: string | null;
          mission_en: string | null;
          values_ar: string[] | null;
          values_en: string[] | null;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          address_ar: string | null;
          address_en: string | null;
          maps_url: string | null;
          latitude: number | null;
          longitude: number | null;
          working_hours_ar: string | null;
          working_hours_en: string | null;
          social_links: Json;
          default_seo_title_ar: string | null;
          default_seo_title_en: string | null;
          default_seo_description_ar: string | null;
          default_seo_description_en: string | null;
          medical_disclaimer_ar: string | null;
          medical_disclaimer_en: string | null;
          announcement_ar: string | null;
          announcement_en: string | null;
          announcement_url: string | null;
          announcement_is_active: boolean;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      testimonials: {
        Row: { id: string; display_name: string | null; anonymous_label_ar: string | null; anonymous_label_en: string | null; review_ar: string; review_en: string | null; rating: number | null; source: string | null; source_url: string | null; display_order: number; is_active: boolean; deleted_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; display_name?: string | null; anonymous_label_ar?: string | null; anonymous_label_en?: string | null; review_ar: string; review_en?: string | null; rating?: number | null; source?: string | null; source_url?: string | null; display_order?: number; is_active?: boolean; deleted_at?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_update_appointment: {
        Args: {
          p_appointment_id: string;
          p_status: AppointmentStatus;
          p_date: string;
          p_time: string;
        };
        Returns: undefined;
      };
      create_appointment: {
        Args: {
          p_service_slug: string;
          p_date: string;
          p_time: string;
          p_patient_name: string;
          p_patient_phone: string;
          p_notes?: string | null;
        };
        Returns: Array<{
          appointment_id: string;
          booking_reference: string;
          status: AppointmentStatus;
        }>;
      };
      get_available_slots: {
        Args: { p_date: string };
        Returns: Array<{ slot_time: string }>;
      };
    };
    Enums: {
      admin_role: AdminRole;
      appointment_status: AppointmentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
