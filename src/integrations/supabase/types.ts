export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bets: {
        Row: {
          asset_id: string | null;
          bet_type: string;
          created_at: string;
          direction: string | null;
          end_price: number | null;
          id: string;
          opponent_id: string | null;
          opponent_start_steps: number | null;
          payout_multiplier: number;
          resolved_at: string | null;
          resolves_at: string;
          stake: number;
          start_price: number | null;
          start_steps: number | null;
          status: string;
          target_value: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          asset_id?: string | null;
          bet_type: string;
          created_at?: string;
          direction?: string | null;
          end_price?: number | null;
          id?: string;
          opponent_id?: string | null;
          opponent_start_steps?: number | null;
          payout_multiplier?: number;
          resolved_at?: string | null;
          resolves_at: string;
          stake: number;
          start_price?: number | null;
          start_steps?: number | null;
          status?: string;
          target_value?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          asset_id?: string | null;
          bet_type?: string;
          created_at?: string;
          direction?: string | null;
          end_price?: number | null;
          id?: string;
          opponent_id?: string | null;
          opponent_start_steps?: number | null;
          payout_multiplier?: number;
          resolved_at?: string | null;
          resolves_at?: string;
          stake?: number;
          start_price?: number | null;
          start_steps?: number | null;
          status?: string;
          target_value?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      holdings: {
        Row: {
          asset_id: string;
          avg_price: number;
          created_at: string;
          id: string;
          shares: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          asset_id: string;
          avg_price?: number;
          created_at?: string;
          id?: string;
          shares?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          asset_id?: string;
          avg_price?: number;
          created_at?: string;
          id?: string;
          shares?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          coins: number;
          created_at: string;
          display_name: string;
          id: string;
          last_sync: string | null;
          steps_today: number;
          total_steps: number;
          updated_at: string;
        };
        Insert: {
          coins?: number;
          created_at?: string;
          display_name?: string;
          id: string;
          last_sync?: string | null;
          steps_today?: number;
          total_steps?: number;
          updated_at?: string;
        };
        Update: {
          coins?: number;
          created_at?: string;
          display_name?: string;
          id?: string;
          last_sync?: string | null;
          steps_today?: number;
          total_steps?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      wellness_logs: {
        Row: {
          activity_score: number;
          coins_earned: number;
          created_at: string;
          date: string;
          id: string;
          journal: string | null;
          mood: number;
          sleep: number;
          steps: number;
          updated_at: string;
          user_id: string;
          water: number;
          workout: boolean;
        };
        Insert: {
          activity_score: number;
          coins_earned: number;
          created_at?: string;
          date: string;
          id?: string;
          journal?: string | null;
          mood: number;
          sleep?: number;
          steps?: number;
          updated_at?: string;
          user_id: string;
          water?: number;
          workout?: boolean;
        };
        Update: {
          activity_score?: number;
          coins_earned?: number;
          created_at?: string;
          date?: string;
          id?: string;
          journal?: string | null;
          mood?: number;
          sleep?: number;
          steps?: number;
          updated_at?: string;
          user_id?: string;
          water?: number;
          workout?: boolean;
        };
        Relationships: [];
      };
      asset_movements: {
        Row: {
          asset_id: string;
          coins_delta: number;
          created_at: string;
          id: string;
          movement_type: string;
          price: number;
          shares: number;
          shares_after: number;
          user_id: string;
        };
        Insert: {
          asset_id: string;
          coins_delta: number;
          created_at?: string;
          id?: string;
          movement_type: string;
          price: number;
          shares: number;
          shares_after: number;
          user_id: string;
        };
        Update: {
          asset_id?: string;
          coins_delta?: number;
          created_at?: string;
          id?: string;
          movement_type?: string;
          price?: number;
          shares?: number;
          shares_after?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      market_assets: {
        Row: {
          change: number;
          description: string;
          id: string;
          name: string;
          price: number;
          ticker: string;
          updated_at: string;
        };
        Insert: {
          change?: number;
          description: string;
          id: string;
          name: string;
          price: number;
          ticker: string;
          updated_at?: string;
        };
        Update: {
          change?: number;
          description?: string;
          id?: string;
          name?: string;
          price?: number;
          ticker?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          kind: string;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          kind: string;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_activity_score: {
        Args: { p_sleep: number; p_steps: number; p_water: number; p_workout: boolean };
        Returns: number;
      };
      place_bet: {
        Args: {
          p_asset_id?: string;
          p_bet_type: string;
          p_direction?: string;
          p_opponent_id?: string;
          p_resolves_at?: string;
          p_stake: number;
          p_target_steps?: number;
        };
        Returns: Database["public"]["Tables"]["bets"]["Row"];
      };
      resolve_due_bets: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["bets"]["Row"][];
      };
      submit_wellness_check_in: {
        Args: {
          p_date: string;
          p_journal?: string | null;
          p_mood: number;
          p_sleep: number;
          p_steps: number;
          p_water: number;
          p_workout: boolean;
        };
        Returns: Json;
      };
      tick_market: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      trade_asset: {
        Args: { p_asset_id: string; p_shares: number; p_side: string };
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
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
