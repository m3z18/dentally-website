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
          display_order?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["doctors"]["Insert"]>;
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
          is_active: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          is_active?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
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
