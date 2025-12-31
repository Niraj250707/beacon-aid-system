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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          created_at: string
          daily_spent: number | null
          enrolled_at: string
          household_size: number | null
          id: string
          last_transaction_date: string | null
          name: string
          phone: string | null
          program_id: string
          status: Database["public"]["Enums"]["beneficiary_status"] | null
          total_received: number | null
          total_spent: number | null
          updated_at: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          daily_spent?: number | null
          enrolled_at?: string
          household_size?: number | null
          id?: string
          last_transaction_date?: string | null
          name: string
          phone?: string | null
          program_id: string
          status?: Database["public"]["Enums"]["beneficiary_status"] | null
          total_received?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          daily_spent?: number | null
          enrolled_at?: string
          household_size?: number | null
          id?: string
          last_transaction_date?: string | null
          name?: string
          phone?: string | null
          program_id?: string
          status?: Database["public"]["Enums"]["beneficiary_status"] | null
          total_received?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_programs: {
        Row: {
          amount_donated: number | null
          created_at: string
          donor_id: string
          id: string
          program_id: string
        }
        Insert: {
          amount_donated?: number | null
          created_at?: string
          donor_id: string
          id?: string
          program_id: string
        }
        Update: {
          amount_donated?: number | null
          created_at?: string
          donor_id?: string
          id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_programs_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          created_at: string
          id: string
          total_donated: number | null
          updated_at: string
          user_id: string
          voting_power: number | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_donated?: number | null
          updated_at?: string
          user_id: string
          voting_power?: number | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          total_donated?: number | null
          updated_at?: string
          user_id?: string
          voting_power?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      merchants: {
        Row: {
          business_name: string
          category: Database["public"]["Enums"]["merchant_category"]
          created_at: string
          id: string
          program_id: string
          registered_at: string
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_reason: string | null
          risk_score: number | null
          status: Database["public"]["Enums"]["merchant_status"] | null
          total_cashed_out: number | null
          total_received: number | null
          updated_at: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          business_name: string
          category: Database["public"]["Enums"]["merchant_category"]
          created_at?: string
          id?: string
          program_id: string
          registered_at?: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_reason?: string | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["merchant_status"] | null
          total_cashed_out?: number | null
          total_received?: number | null
          updated_at?: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          business_name?: string
          category?: Database["public"]["Enums"]["merchant_category"]
          created_at?: string
          id?: string
          program_id?: string
          registered_at?: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_reason?: string | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["merchant_status"] | null
          total_cashed_out?: number | null
          total_received?: number | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchants_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          id: string
          kyc_hash: string | null
          kyc_verified: boolean | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          village: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          kyc_hash?: string | null
          kyc_verified?: boolean | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          village?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          kyc_hash?: string | null
          kyc_verified?: boolean | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          village?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          beneficiary_count: number | null
          created_at: string
          created_by: string | null
          daily_limit: number
          description: string | null
          disaster_type: Database["public"]["Enums"]["disaster_type"]
          distributed_amount: number | null
          district: string
          end_date: string
          id: string
          merchant_count: number | null
          name: string
          per_household_allocation: number
          start_date: string
          state: string
          status: Database["public"]["Enums"]["program_status"] | null
          total_budget: number
          updated_at: string
        }
        Insert: {
          beneficiary_count?: number | null
          created_at?: string
          created_by?: string | null
          daily_limit: number
          description?: string | null
          disaster_type: Database["public"]["Enums"]["disaster_type"]
          distributed_amount?: number | null
          district: string
          end_date: string
          id?: string
          merchant_count?: number | null
          name: string
          per_household_allocation: number
          start_date: string
          state: string
          status?: Database["public"]["Enums"]["program_status"] | null
          total_budget?: number
          updated_at?: string
        }
        Update: {
          beneficiary_count?: number | null
          created_at?: string
          created_by?: string | null
          daily_limit?: number
          description?: string | null
          disaster_type?: Database["public"]["Enums"]["disaster_type"]
          distributed_amount?: number | null
          district?: string
          end_date?: string
          id?: string
          merchant_count?: number | null
          name?: string
          per_household_allocation?: number
          start_date?: string
          state?: string
          status?: Database["public"]["Enums"]["program_status"] | null
          total_budget?: number
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string
          current_value: number
          description: string | null
          id: string
          program_id: string
          proposed_field: string
          proposed_value: number
          proposer_address: string
          status: Database["public"]["Enums"]["proposal_status"] | null
          title: string
          votes_against: number | null
          votes_for: number | null
          voting_ends_at: string
        }
        Insert: {
          created_at?: string
          current_value: number
          description?: string | null
          id?: string
          program_id: string
          proposed_field: string
          proposed_value: number
          proposer_address: string
          status?: Database["public"]["Enums"]["proposal_status"] | null
          title: string
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at: string
        }
        Update: {
          created_at?: string
          current_value?: number
          description?: string | null
          id?: string
          program_id?: string
          proposed_field?: string
          proposed_value?: number
          proposer_address?: string
          status?: Database["public"]["Enums"]["proposal_status"] | null
          title?: string
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          block_number: number | null
          category: Database["public"]["Enums"]["merchant_category"] | null
          created_at: string
          from_address: string
          id: string
          program_id: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          timestamp: string
          to_address: string
          tx_hash: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          block_number?: number | null
          category?: Database["public"]["Enums"]["merchant_category"] | null
          created_at?: string
          from_address: string
          id?: string
          program_id: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          timestamp?: string
          to_address: string
          tx_hash?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          block_number?: number | null
          category?: Database["public"]["Enums"]["merchant_category"] | null
          created_at?: string
          from_address?: string
          id?: string
          program_id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          timestamp?: string
          to_address?: string
          tx_hash?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          vote_for: boolean
          voter_id: string
          voting_power: number
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          vote_for: boolean
          voter_id: string
          voting_power: number
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          vote_for?: boolean
          voter_id?: string
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "donor" | "beneficiary" | "merchant" | "field_agent"
      beneficiary_status: "pending" | "verified" | "active" | "suspended"
      disaster_type:
        | "flood"
        | "earthquake"
        | "cyclone"
        | "drought"
        | "pandemic"
        | "fire"
        | "other"
      merchant_category: "food" | "health" | "shelter" | "fuel" | "other"
      merchant_status:
        | "pending"
        | "verified"
        | "active"
        | "suspended"
        | "flagged"
      program_status: "draft" | "active" | "paused" | "completed" | "closed"
      proposal_status: "pending" | "active" | "passed" | "rejected" | "executed"
      risk_level: "low" | "medium" | "high" | "critical"
      transaction_status: "pending" | "confirmed" | "failed"
      transaction_type:
        | "airdrop"
        | "payment"
        | "cashout"
        | "clawback"
        | "donation"
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
    Enums: {
      app_role: ["admin", "donor", "beneficiary", "merchant", "field_agent"],
      beneficiary_status: ["pending", "verified", "active", "suspended"],
      disaster_type: [
        "flood",
        "earthquake",
        "cyclone",
        "drought",
        "pandemic",
        "fire",
        "other",
      ],
      merchant_category: ["food", "health", "shelter", "fuel", "other"],
      merchant_status: [
        "pending",
        "verified",
        "active",
        "suspended",
        "flagged",
      ],
      program_status: ["draft", "active", "paused", "completed", "closed"],
      proposal_status: ["pending", "active", "passed", "rejected", "executed"],
      risk_level: ["low", "medium", "high", "critical"],
      transaction_status: ["pending", "confirmed", "failed"],
      transaction_type: [
        "airdrop",
        "payment",
        "cashout",
        "clawback",
        "donation",
      ],
    },
  },
} as const
