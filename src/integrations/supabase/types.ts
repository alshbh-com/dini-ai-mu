export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      answer_feedback: {
        Row: {
          answer_text: string | null
          comment: string | null
          created_at: string
          id: string
          is_helpful: boolean
          question_id: string | null
          user_ip: string
        }
        Insert: {
          answer_text?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful: boolean
          question_id?: string | null
          user_ip: string
        }
        Update: {
          answer_text?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful?: boolean
          question_id?: string | null
          user_ip?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_feedback_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_quiz_answers: {
        Row: {
          created_at: string
          date: string
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: number
          user_ip: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: number
          user_ip: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: number
          user_ip?: string
        }
        Relationships: []
      }
      daily_quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string
          date: string
          explanation: string
          id: string
          options: Json
          question: string
          source: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          date?: string
          explanation: string
          id?: string
          options: Json
          question: string
          source: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          date?: string
          explanation?: string
          id?: string
          options?: Json
          question?: string
          source?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          question_id: string | null
          user_ip: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id?: string | null
          user_ip: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string | null
          user_ip?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_favorite: boolean | null
          question: string
          source: string | null
          user_ip: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          question: string
          source?: string | null
          user_ip?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          question?: string
          source?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          created_at: string
          daily_users: number | null
          date: string
          id: string
          total_questions: number | null
        }
        Insert: {
          created_at?: string
          daily_users?: number | null
          date?: string
          id?: string
          total_questions?: number | null
        }
        Update: {
          created_at?: string
          daily_users?: number | null
          date?: string
          id?: string
          total_questions?: number | null
        }
        Relationships: []
      }
      subscription_activations: {
        Row: {
          activated_by: string | null
          activated_features: Json | null
          activation_date: string
          id: string
          notes: string | null
          subscription_id: string | null
          user_identifier: string
        }
        Insert: {
          activated_by?: string | null
          activated_features?: Json | null
          activation_date?: string
          id?: string
          notes?: string | null
          subscription_id?: string | null
          user_identifier: string
        }
        Update: {
          activated_by?: string | null
          activated_features?: Json | null
          activation_date?: string
          id?: string
          notes?: string | null
          subscription_id?: string | null
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_activations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_features: {
        Row: {
          created_at: string
          feature_description_ar: string | null
          feature_key: string
          feature_name_ar: string
          id: string
          is_premium: boolean
        }
        Insert: {
          created_at?: string
          feature_description_ar?: string | null
          feature_key: string
          feature_name_ar: string
          id?: string
          is_premium?: boolean
        }
        Update: {
          created_at?: string
          feature_description_ar?: string | null
          feature_key?: string
          feature_name_ar?: string
          id?: string
          is_premium?: boolean
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activated_by: string | null
          created_at: string
          end_date: string
          features_enabled: Json | null
          id: string
          is_active: boolean
          last_activated: string | null
          start_date: string
          subscription_type: string
          updated_at: string
          user_ip: string
        }
        Insert: {
          activated_by?: string | null
          created_at?: string
          end_date?: string
          features_enabled?: Json | null
          id?: string
          is_active?: boolean
          last_activated?: string | null
          start_date?: string
          subscription_type?: string
          updated_at?: string
          user_ip: string
        }
        Update: {
          activated_by?: string | null
          created_at?: string
          end_date?: string
          features_enabled?: Json | null
          id?: string
          is_active?: boolean
          last_activated?: string | null
          start_date?: string
          subscription_type?: string
          updated_at?: string
          user_ip?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
