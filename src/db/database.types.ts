export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      dog_owners: {
        Row: {
          created_at: string | null;
          dog_id: string;
          id: string;
          is_primary: boolean | null;
          owner_id: string;
        };
        Insert: {
          created_at?: string | null;
          dog_id: string;
          id?: string;
          is_primary?: boolean | null;
          owner_id: string;
        };
        Update: {
          created_at?: string | null;
          dog_id?: string;
          id?: string;
          is_primary?: boolean | null;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dog_owners_dog_id_fkey";
            columns: ["dog_id"];
            isOneToOne: false;
            referencedRelation: "dogs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dog_owners_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["id"];
          },
        ];
      };
      dogs: {
        Row: {
          birth_date: string;
          created_at: string | null;
          deleted_at: string | null;
          father_name: string | null;
          gender: Database["public"]["Enums"]["dog_gender"];
          id: string;
          kennel_name: string | null;
          microchip_number: string | null;
          mother_name: string | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          birth_date: string;
          created_at?: string | null;
          deleted_at?: string | null;
          father_name?: string | null;
          gender: Database["public"]["Enums"]["dog_gender"];
          id?: string;
          kennel_name?: string | null;
          microchip_number?: string | null;
          mother_name?: string | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          birth_date?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          father_name?: string | null;
          gender?: Database["public"]["Enums"]["dog_gender"];
          id?: string;
          kennel_name?: string | null;
          microchip_number?: string | null;
          mother_name?: string | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      evaluations: {
        Row: {
          baby_puppy_grade:
            | Database["public"]["Enums"]["baby_puppy_grade"]
            | null;
          club_title: Database["public"]["Enums"]["club_title"] | null;
          created_at: string | null;
          dog_class: Database["public"]["Enums"]["dog_class"];
          dog_id: string;
          grade: Database["public"]["Enums"]["evaluation_grade"] | null;
          id: string;
          placement: Database["public"]["Enums"]["placement"] | null;
          show_id: string;
          updated_at: string | null;
        };
        Insert: {
          baby_puppy_grade?:
            | Database["public"]["Enums"]["baby_puppy_grade"]
            | null;
          club_title?: Database["public"]["Enums"]["club_title"] | null;
          created_at?: string | null;
          dog_class: Database["public"]["Enums"]["dog_class"];
          dog_id: string;
          grade?: Database["public"]["Enums"]["evaluation_grade"] | null;
          id?: string;
          placement?: Database["public"]["Enums"]["placement"] | null;
          show_id: string;
          updated_at?: string | null;
        };
        Update: {
          baby_puppy_grade?:
            | Database["public"]["Enums"]["baby_puppy_grade"]
            | null;
          club_title?: Database["public"]["Enums"]["club_title"] | null;
          created_at?: string | null;
          dog_class?: Database["public"]["Enums"]["dog_class"];
          dog_id?: string;
          grade?: Database["public"]["Enums"]["evaluation_grade"] | null;
          id?: string;
          placement?: Database["public"]["Enums"]["placement"] | null;
          show_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "evaluations_dog_id_fkey";
            columns: ["dog_id"];
            isOneToOne: false;
            referencedRelation: "dogs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_show_id_fkey";
            columns: ["show_id"];
            isOneToOne: false;
            referencedRelation: "shows";
            referencedColumns: ["id"];
          },
        ];
      };
      owners: {
        Row: {
          address: string;
          city: string;
          created_at: string | null;
          deleted_at: string | null;
          email: string;
          first_name: string;
          gdpr_consent: boolean | null;
          gdpr_consent_date: string | null;
          id: string;
          kennel_name: string | null;
          last_name: string;
          phone: string | null;
          postal_code: string | null;
          updated_at: string | null;
        };
        Insert: {
          address: string;
          city: string;
          created_at?: string | null;
          deleted_at?: string | null;
          email: string;
          first_name: string;
          gdpr_consent?: boolean | null;
          gdpr_consent_date?: string | null;
          id?: string;
          kennel_name?: string | null;
          last_name: string;
          phone?: string | null;
          postal_code?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string;
          city?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string;
          first_name?: string;
          gdpr_consent?: boolean | null;
          gdpr_consent_date?: string | null;
          id?: string;
          kennel_name?: string | null;
          last_name?: string;
          phone?: string | null;
          postal_code?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      show_registrations: {
        Row: {
          catalog_number: number | null;
          dog_class: Database["public"]["Enums"]["dog_class"];
          dog_id: string;
          id: string;
          registered_at: string | null;
          show_id: string;
        };
        Insert: {
          catalog_number?: number | null;
          dog_class: Database["public"]["Enums"]["dog_class"];
          dog_id: string;
          id?: string;
          registered_at?: string | null;
          show_id: string;
        };
        Update: {
          catalog_number?: number | null;
          dog_class?: Database["public"]["Enums"]["dog_class"];
          dog_id?: string;
          id?: string;
          registered_at?: string | null;
          show_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "show_registrations_dog_id_fkey";
            columns: ["dog_id"];
            isOneToOne: false;
            referencedRelation: "dogs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "show_registrations_show_id_fkey";
            columns: ["show_id"];
            isOneToOne: false;
            referencedRelation: "shows";
            referencedColumns: ["id"];
          },
        ];
      };
      shows: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          judge_name: string;
          location: string;
          max_participants: number | null;
          name: string;
          registration_deadline: string;
          show_date: string;
          status: Database["public"]["Enums"]["show_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          judge_name: string;
          location: string;
          max_participants?: number | null;
          name: string;
          registration_deadline: string;
          show_date: string;
          status?: Database["public"]["Enums"]["show_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          judge_name?: string;
          location?: string;
          max_participants?: number | null;
          name?: string;
          registration_deadline?: string;
          show_date?: string;
          status?: Database["public"]["Enums"]["show_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          email: string;
          first_name: string;
          id: string;
          is_active: boolean | null;
          last_name: string;
          password_hash: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          email: string;
          first_name: string;
          id?: string;
          is_active?: boolean | null;
          last_name: string;
          password_hash: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string;
          first_name?: string;
          id?: string;
          is_active?: boolean | null;
          last_name?: string;
          password_hash?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_catalog_numbers: {
        Args: { show_id_param: string };
        Returns: undefined;
      };
      schedule_data_deletion: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      validate_dog_class: {
        Args: {
          birth_date_param: string;
          show_date_param: string;
          class_param: Database["public"]["Enums"]["dog_class"];
        };
        Returns: boolean;
      };
    };
    Enums: {
      baby_puppy_grade: "bardzo_obiecujący" | "obiecujący" | "dość_obiecujący";
      club_title:
        | "młodzieżowy_zwycięzca_klubu"
        | "zwycięzca_klubu"
        | "zwycięzca_klubu_weteranów"
        | "najlepszy_reproduktor"
        | "najlepsza_suka_hodowlana"
        | "najlepsza_para"
        | "najlepsza_hodowla"
        | "zwycięzca_rasy"
        | "zwycięzca_płci_przeciwnej"
        | "najlepszy_junior"
        | "najlepszy_weteran";
      dog_class:
        | "baby"
        | "puppy"
        | "junior"
        | "intermediate"
        | "open"
        | "working"
        | "champion"
        | "veteran";
      dog_gender: "male" | "female";
      evaluation_grade:
        | "doskonała"
        | "bardzo_dobra"
        | "dobra"
        | "zadowalająca"
        | "zdyskwalifikowana"
        | "nieobecna";
      placement: "1st" | "2nd" | "3rd" | "4th";
      show_status:
        | "draft"
        | "open_for_registration"
        | "registration_closed"
        | "in_progress"
        | "completed"
        | "cancelled";
      user_role: "club_board";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      baby_puppy_grade: ["bardzo_obiecujący", "obiecujący", "dość_obiecujący"],
      club_title: [
        "młodzieżowy_zwycięzca_klubu",
        "zwycięzca_klubu",
        "zwycięzca_klubu_weteranów",
        "najlepszy_reproduktor",
        "najlepsza_suka_hodowlana",
        "najlepsza_para",
        "najlepsza_hodowla",
        "zwycięzca_rasy",
        "zwycięzca_płci_przeciwnej",
        "najlepszy_junior",
        "najlepszy_weteran",
      ],
      dog_class: [
        "baby",
        "puppy",
        "junior",
        "intermediate",
        "open",
        "working",
        "champion",
        "veteran",
      ],
      dog_gender: ["male", "female"],
      evaluation_grade: [
        "doskonała",
        "bardzo_dobra",
        "dobra",
        "zadowalająca",
        "zdyskwalifikowana",
        "nieobecna",
      ],
      placement: ["1st", "2nd", "3rd", "4th"],
      show_status: [
        "draft",
        "open_for_registration",
        "registration_closed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["club_board"],
    },
  },
} as const;
