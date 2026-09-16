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
      competition_registrations: {
        Row: {
          competition_id: string
          created_at: string
          group_name: string | null
          id: string
          notes: string | null
          payment_proof_url: string | null
          status: Database["public"]["Enums"]["registration_status"]
          team_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          group_name?: string | null
          id?: string
          notes?: string | null
          payment_proof_url?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          group_name?: string | null
          id?: string
          notes?: string | null
          payment_proof_url?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_registrations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          age_category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          entry_fee: number
          format: Database["public"]["Enums"]["competition_format"]
          id: string
          location: string | null
          logo_url: string | null
          max_teams: number
          name: string
          organizer_id: string
          slug: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["competition_status"]
        }
        Insert: {
          age_category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number
          format?: Database["public"]["Enums"]["competition_format"]
          id?: string
          location?: string | null
          logo_url?: string | null
          max_teams?: number
          name: string
          organizer_id: string
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["competition_status"]
        }
        Update: {
          age_category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number
          format?: Database["public"]["Enums"]["competition_format"]
          id?: string
          location?: string | null
          logo_url?: string | null
          max_teams?: number
          name?: string
          organizer_id?: string
          slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["competition_status"]
        }
        Relationships: [
          {
            foreignKeyName: "competitions_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "event_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_organizers: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          status: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          status?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          status?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["match_event_type"]
          id: string
          match_id: string
          minute: number | null
          note: string | null
          player_id: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["match_event_type"]
          id?: string
          match_id: string
          minute?: number | null
          note?: string | null
          player_id?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["match_event_type"]
          id?: string
          match_id?: string
          minute?: number | null
          note?: string | null
          player_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          created_at: string
          id: string
          is_starter: boolean
          match_id: string
          player_id: string
          shirt_position: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_starter?: boolean
          match_id: string
          player_id: string
          shirt_position?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_starter?: boolean
          match_id?: string
          player_id?: string
          shirt_position?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number
          away_team_id: string | null
          competition_id: string
          created_at: string
          home_score: number
          home_team_id: string | null
          id: string
          kickoff_at: string | null
          matchday: number | null
          referee: string | null
          stage: string | null
          status: Database["public"]["Enums"]["match_status"]
          venue: string | null
        }
        Insert: {
          away_score?: number
          away_team_id?: string | null
          competition_id: string
          created_at?: string
          home_score?: number
          home_team_id?: string | null
          id?: string
          kickoff_at?: string | null
          matchday?: number | null
          referee?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          venue?: string | null
        }
        Update: {
          away_score?: number
          away_team_id?: string | null
          competition_id?: string
          created_at?: string
          home_score?: number
          home_team_id?: string | null
          id?: string
          kickoff_at?: string | null
          matchday?: number | null
          referee?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          proof_url: string | null
          registration_id: string
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          proof_url?: string | null
          registration_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          proof_url?: string | null
          registration_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "competition_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      team_players: {
        Row: {
          birth_date: string | null
          created_at: string
          full_name: string
          id: string
          id_document_url: string | null
          jersey_number: number | null
          photo_url: string | null
          position: string | null
          team_id: string
          verified: boolean
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          full_name: string
          id?: string
          id_document_url?: string | null
          jersey_number?: number | null
          photo_url?: string | null
          position?: string | null
          team_id: string
          verified?: boolean
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          full_name?: string
          id?: string
          id_document_url?: string | null
          jersey_number?: number | null
          photo_url?: string | null
          position?: string | null
          team_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          city: string | null
          created_at: string
          id: string
          logo_url: string | null
          manager_id: string | null
          name: string
          short_name: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          manager_id?: string | null
          name: string
          short_name?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          manager_id?: string | null
          name?: string
          short_name?: string | null
        }
        Relationships: []
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
    }
    Views: {
      standings_view: {
        Row: {
          competition_id: string | null
          draws: number | null
          goal_diff: number | null
          goals_against: number | null
          goals_for: number | null
          logo_url: string | null
          losses: number | null
          played: number | null
          points: number | null
          team_id: string | null
          team_name: string | null
          wins: number | null
        }
        Relationships: []
      }
      top_scorers_view: {
        Row: {
          assists: number | null
          competition_id: string | null
          goals: number | null
          photo_url: string | null
          player_id: string | null
          player_name: string | null
          position: string | null
          red_cards: number | null
          team_name: string | null
          yellow_cards: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      manages_team: { Args: { _team_id: string }; Returns: boolean }
      owns_competition: { Args: { _competition_id: string }; Returns: boolean }
      owns_match: { Args: { _match_id: string }; Returns: boolean }
      owns_organizer: { Args: { _organizer_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "organizer" | "team_manager"
      competition_format: "league" | "group_knockout" | "knockout"
      competition_status:
        | "draft"
        | "registration_open"
        | "in_progress"
        | "completed"
      match_event_type:
        | "goal"
        | "assist"
        | "yellow_card"
        | "red_card"
        | "substitution"
        | "penalty"
      match_status: "scheduled" | "lineup_submitted" | "live" | "finished"
      registration_status: "pending" | "approved" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["super_admin", "organizer", "team_manager"],
      competition_format: ["league", "group_knockout", "knockout"],
      competition_status: [
        "draft",
        "registration_open",
        "in_progress",
        "completed",
      ],
      match_event_type: [
        "goal",
        "assist",
        "yellow_card",
        "red_card",
        "substitution",
        "penalty",
      ],
      match_status: ["scheduled", "lineup_submitted", "live", "finished"],
      registration_status: ["pending", "approved", "rejected"],
    },
  },
} as const
