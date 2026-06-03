import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Initialize supabase client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export type Database = {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string
          victim_id: string | null
          case_number: string
          created_at: string
          updated_at: string
          status: 'open' | 'in_progress' | 'closed' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          incident_date: string | null
          incident_location: string | null
          incident_location_geo: { latitude: number; longitude: number } | null
          narrative_encrypted: string | null
          assigned_to: string | null
          case_type: string | null
          consent_given: boolean
          follow_up_consent: boolean
          created_by_user_id: string
          closed_at: string | null
          evidence_expires_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cases']['Row']>
      }
      case_messages: {
        Row: {
          id: string
          case_id: string
          sender_id: string
          message_encrypted: string
          created_at: string
          read_at: string | null
          sender_role: 'victim' | 'caseworker'
        }
        Insert: Omit<Database['public']['Tables']['case_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['case_messages']['Row']>
      }
      case_notes: {
        Row: {
          id: string
          case_id: string
          author_id: string
          note_encrypted: string
          created_at: string
          updated_at: string
          is_private: boolean
        }
        Insert: Omit<Database['public']['Tables']['case_notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['case_notes']['Row']>
      }
      evidence: {
        Row: {
          id: string
          case_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_by: string
          uploaded_at: string
          expires_at: string | null
          is_locked: boolean
          metadata_encrypted: string | null
        }
        Insert: Omit<Database['public']['Tables']['evidence']['Row'], 'id' | 'uploaded_at'>
        Update: Partial<Database['public']['Tables']['evidence']['Row']>
      }
      audit_log: {
        Row: {
          id: string
          case_id: string | null
          user_id: string
          action: string
          description: string
          timestamp: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'timestamp'>
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>
      }
      resources: {
        Row: {
          id: string
          category: string
          title: string
          description: string
          phone_number: string | null
          website: string | null
          is_available_offline: boolean
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['resources']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['resources']['Row']>
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'victim' | 'caseworker' | 'admin' | 'analyst'
          created_at: string
          updated_at: string
          is_active: boolean
          last_login: string | null
          phone_number: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
    }
  }
}
