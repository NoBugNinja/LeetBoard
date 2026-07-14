export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          leetcode_username: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          leetcode_username: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          leetcode_username?: string;
          created_at?: string;
        };
      };
      stats: {
        Row: {
          user_id: string;
          easy: number;
          medium: number;
          hard: number;
          total: number;
          contest_rating: number;
          contest_ranking: number;
          reputation: number;
          raw_json: Json | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          easy?: number;
          medium?: number;
          hard?: number;
          total?: number;
          contest_rating?: number;
          contest_ranking?: number;
          reputation?: number;
          raw_json?: Json | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          easy?: number;
          medium?: number;
          hard?: number;
          total?: number;
          contest_rating?: number;
          contest_ranking?: number;
          reputation?: number;
          raw_json?: Json | null;
          updated_at?: string;
        };
      };
      history: {
        Row: {
          id: string;
          user_id: string;
          easy: number;
          medium: number;
          hard: number;
          total: number;
          contest_rating: number;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          easy?: number;
          medium?: number;
          hard?: number;
          total?: number;
          contest_rating?: number;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          easy?: number;
          medium?: number;
          hard?: number;
          total?: number;
          contest_rating?: number;
          fetched_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
