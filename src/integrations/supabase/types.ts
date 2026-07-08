export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          active: boolean
          city: string | null
          created_at: string
          crop: string
          direction: string
          id: string
          target_price: number
          user_id: string
        }
        Insert: {
          active?: boolean
          city?: string | null
          created_at?: string
          crop: string
          direction: string
          id?: string
          target_price: number
          user_id: string
        }
        Update: {
          active?: boolean
          city?: string | null
          created_at?: string
          crop?: string
          direction?: string
          id?: string
          target_price?: number
          user_id?: string
        }
        Relationships: []
      }
      cooperative_members: {
        Row: {
          cooperative_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          cooperative_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          cooperative_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_members_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperatives: {
        Row: {
          created_at: string
          created_by: string
          id: string
          join_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          join_code: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          join_code?: string
          name?: string
        }
        Relationships: []
      }
      favorite_markets: {
        Row: {
          city: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      produce: {
        Row: {
          created_at: string
          crop: string
          id: string
          quantity: number
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop: string
          id?: string
          quantity: number
          unit?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop?: string
          id?: string
          quantity?: number
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string
          created_at: string
          name: string
          phone: string | null
          primary_crop: string
          user_id: string
        }
        Insert: {
          city?: string
          created_at?: string
          name?: string
          phone?: string | null
          primary_crop?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          name?: string
          phone?: string | null
          primary_crop?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_history: {
        Row: {
          city_sold: string
          created_at: string
          crop: string
          date: string
          id: string
          price: number
          price_difference: number | null
          quantity: number
          recommended_price_at_sale: number | null
          revenue: number | null
          unit: string
          user_id: string
        }
        Insert: {
          city_sold: string
          created_at?: string
          crop: string
          date?: string
          id?: string
          price: number
          price_difference?: number | null
          quantity?: number
          recommended_price_at_sale?: number | null
          revenue?: number | null
          unit?: string
          user_id: string
        }
        Update: {
          city_sold?: string
          created_at?: string
          crop?: string
          date?: string
          id?: string
          price?: number
          price_difference?: number | null
          quantity?: number
          recommended_price_at_sale?: number | null
          revenue?: number | null
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_coop_member: {
        Args: { _coop_id: string; _user_id: string }
        Returns: boolean
      }
      join_cooperative_by_code: {
        Args: { _code: string }
        Returns: {
          id: string
          join_code: string
          name: string
        }[]
      }
      my_coop_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
