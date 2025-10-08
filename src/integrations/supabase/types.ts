export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      billing_settings: {
        Row: {
          billing_country: string | null
          billing_email: string | null
          created_at: string | null
          id: string
          invoice_prefix: string | null
          paypal_customer_id: string | null
          preferred_currency: string | null
          reminder_days_before: number | null
          send_invoice_email: boolean | null
          send_renewal_reminders: boolean | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_country?: string | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          invoice_prefix?: string | null
          paypal_customer_id?: string | null
          preferred_currency?: string | null
          reminder_days_before?: number | null
          send_invoice_email?: boolean | null
          send_renewal_reminders?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_country?: string | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          invoice_prefix?: string | null
          paypal_customer_id?: string | null
          preferred_currency?: string | null
          reminder_days_before?: number | null
          send_invoice_email?: boolean | null
          send_renewal_reminders?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          is_like: boolean
          profile_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          is_like: boolean
          profile_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          is_like?: boolean
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          movie_id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          movie_id: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          movie_id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_data: Json | null
          invoice_number: string
          issued_at: string | null
          paid_at: string | null
          payment_transaction_id: string | null
          status: string | null
          subscriber_id: string | null
          tax_amount_cents: number | null
          total_amount_cents: number
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_number: string
          issued_at?: string | null
          paid_at?: string | null
          payment_transaction_id?: string | null
          status?: string | null
          subscriber_id?: string | null
          tax_amount_cents?: number | null
          total_amount_cents: number
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_number?: string
          issued_at?: string | null
          paid_at?: string | null
          payment_transaction_id?: string | null
          status?: string | null
          subscriber_id?: string | null
          tax_amount_cents?: number | null
          total_amount_cents?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_ratings: {
        Row: {
          created_at: string
          id: string
          movie_id: string
          profile_id: string
          rating: number
          review: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id: string
          profile_id: string
          rating: number
          review?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: string
          profile_id?: string
          rating?: number
          review?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_ratings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          age_rating: string | null
          backdrop_url: string | null
          created_at: string
          description: string | null
          duration: number | null
          episodes: Json | null
          genre: string | null
          id: string
          poster_url: string | null
          rating: number | null
          release_year: number | null
          seasons: number | null
          title: string
          type: string | null
          updated_at: string
          use_file_instead_of_url: boolean | null
          video_file_name: string | null
          video_file_path: string | null
          video_url: string
        }
        Insert: {
          age_rating?: string | null
          backdrop_url?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          episodes?: Json | null
          genre?: string | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          seasons?: number | null
          title: string
          type?: string | null
          updated_at?: string
          use_file_instead_of_url?: boolean | null
          video_file_name?: string | null
          video_file_path?: string | null
          video_url: string
        }
        Update: {
          age_rating?: string | null
          backdrop_url?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          episodes?: Json | null
          genre?: string | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          seasons?: number | null
          title?: string
          type?: string | null
          updated_at?: string
          use_file_instead_of_url?: boolean | null
          video_file_name?: string | null
          video_file_path?: string | null
          video_url?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          payment_method: string | null
          paypal_order_id: string
          paypal_payer_id: string | null
          paypal_payment_id: string | null
          paypal_response: Json | null
          plan_id: string | null
          processed_at: string | null
          status: string | null
          subscriber_id: string | null
          transaction_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          payment_method?: string | null
          paypal_order_id: string
          paypal_payer_id?: string | null
          paypal_payment_id?: string | null
          paypal_response?: Json | null
          plan_id?: string | null
          processed_at?: string | null
          status?: string | null
          subscriber_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          payment_method?: string | null
          paypal_order_id?: string
          paypal_payer_id?: string | null
          paypal_payment_id?: string | null
          paypal_response?: Json | null
          plan_id?: string | null
          processed_at?: string | null
          status?: string | null
          subscriber_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          payment_method: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          subscriber_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          subscriber_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          subscriber_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_adult: boolean | null
          name: string
          pin_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_adult?: boolean | null
          name: string
          pin_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_adult?: boolean | null
          name?: string
          pin_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_analytics: {
        Row: {
          cancellations: number | null
          churn_rate: number | null
          created_at: string | null
          date: string
          gross_revenue_cents: number | null
          id: string
          mrr_cents: number | null
          net_revenue_cents: number | null
          new_subscriptions: number | null
          paypal_fees_cents: number | null
          plan_id: string | null
          refunds: number | null
          renewals: number | null
        }
        Insert: {
          cancellations?: number | null
          churn_rate?: number | null
          created_at?: string | null
          date: string
          gross_revenue_cents?: number | null
          id?: string
          mrr_cents?: number | null
          net_revenue_cents?: number | null
          new_subscriptions?: number | null
          paypal_fees_cents?: number | null
          plan_id?: string | null
          refunds?: number | null
          renewals?: number | null
        }
        Update: {
          cancellations?: number | null
          churn_rate?: number | null
          created_at?: string | null
          date?: string
          gross_revenue_cents?: number | null
          id?: string
          mrr_cents?: number | null
          net_revenue_cents?: number | null
          new_subscriptions?: number | null
          paypal_fees_cents?: number | null
          plan_id?: string | null
          refunds?: number | null
          renewals?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_analytics_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          auto_renewal: boolean | null
          cancelled_at: string | null
          created_at: string
          email: string
          grace_period_end: string | null
          id: string
          last_payment_at: string | null
          next_billing_date: string | null
          payment_method: string | null
          paypal_order_id: string | null
          paypal_subscription_id: string | null
          plan_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_renewal?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          email: string
          grace_period_end?: string | null
          id?: string
          last_payment_at?: string | null
          next_billing_date?: string | null
          payment_method?: string | null
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_renewal?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          email?: string
          grace_period_end?: string | null
          id?: string
          last_payment_at?: string | null
          next_billing_date?: string | null
          payment_method?: string | null
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_end_date: string | null
          new_status: string | null
          notes: string | null
          old_end_date: string | null
          old_status: string | null
          payment_transaction_id: string | null
          plan_id: string | null
          subscriber_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_end_date?: string | null
          new_status?: string | null
          notes?: string | null
          old_end_date?: string | null
          old_status?: string | null
          payment_transaction_id?: string | null
          plan_id?: string | null
          subscriber_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_end_date?: string | null
          new_status?: string | null
          notes?: string | null
          old_end_date?: string | null
          old_status?: string | null
          payment_transaction_id?: string | null
          plan_id?: string | null
          subscriber_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string
          first_visit: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          page_visits: number
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          first_visit?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          page_visits?: number
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          first_visit?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          page_visits?: number
          user_agent?: string | null
        }
        Relationships: []
      }
      voice_room_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string | null
          profile_id: string
          room_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string | null
          profile_id: string
          room_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string | null
          profile_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_room_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "voice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_room_participants: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string
          profile_id: string
          room_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          profile_id: string
          room_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          profile_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_room_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "voice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_rooms: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          is_active: boolean | null
          movie_id: string | null
          name: string
          owner_profile_id: string
          room_settings: Json | null
          screen_sharing_enabled: boolean | null
          screen_sharing_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          is_active?: boolean | null
          movie_id?: string | null
          name: string
          owner_profile_id: string
          room_settings?: Json | null
          screen_sharing_enabled?: boolean | null
          screen_sharing_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          is_active?: boolean | null
          movie_id?: string | null
          name?: string
          owner_profile_id?: string
          room_settings?: Json | null
          screen_sharing_enabled?: boolean | null
          screen_sharing_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_rooms_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_rooms_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_history: {
        Row: {
          completed: boolean | null
          duration_watched: number | null
          episode_number: number | null
          episode_season: number | null
          episode_title: string | null
          id: string
          last_watched_at: string | null
          movie_id: string
          profile_id: string
          progress: number | null
          total_duration: number | null
          watched_at: string
        }
        Insert: {
          completed?: boolean | null
          duration_watched?: number | null
          episode_number?: number | null
          episode_season?: number | null
          episode_title?: string | null
          id?: string
          last_watched_at?: string | null
          movie_id: string
          profile_id: string
          progress?: number | null
          total_duration?: number | null
          watched_at?: string
        }
        Update: {
          completed?: boolean | null
          duration_watched?: number | null
          episode_number?: number | null
          episode_season?: number | null
          episode_title?: string | null
          id?: string
          last_watched_at?: string | null
          movie_id?: string
          profile_id?: string
          progress?: number | null
          total_duration?: number | null
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_later: {
        Row: {
          created_at: string
          id: string
          movie_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_later_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_later_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_subscription: {
        Args: {
          p_user_email: string
          p_plan_id: string
          p_paypal_order_id: string
          p_paypal_subscription_id?: string
          p_duration_days?: number
        }
        Returns: string
      }
      check_user_subscription: {
        Args: { user_email: string }
        Returns: {
          has_subscription: boolean
          subscription_tier: string
          subscription_end: string
        }[]
      }
      check_user_subscription_status: {
        Args: { user_email: string }
        Returns: {
          has_active_subscription: boolean
          subscription_tier: string
          subscription_end: string
          grace_period_end: string
          status: string
          days_remaining: number
          auto_renewal: boolean
          next_billing_date: string
        }[]
      }
      cleanup_expired_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_visitor_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_visitor_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_movie_recommendations: {
        Args: { user_profile_id: string; limit_count?: number }
        Returns: {
          movie_id: string
          title: string
          poster_url: string
          rating: number
          genre: string
          recommendation_score: number
        }[]
      }
      get_watch_progress_percentage: {
        Args: { p_duration_watched: number; p_total_duration: number }
        Returns: number
      }
      record_payment_transaction: {
        Args: {
          p_user_email: string
          p_plan_id: string
          p_paypal_order_id: string
          p_amount_cents: number
          p_status?: string
          p_paypal_response?: Json
        }
        Returns: string
      }
      track_visitor: {
        Args: {
          p_device_fingerprint: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
      upsert_watch_history: {
        Args:
          | {
              p_profile_id: string
              p_movie_id: string
              p_progress: number
              p_duration_watched: number
              p_total_duration: number
              p_completed?: boolean
            }
          | {
              p_profile_id: string
              p_movie_id: string
              p_progress: number
              p_duration_watched: number
              p_total_duration: number
              p_completed?: boolean
              p_episode_season?: number
              p_episode_number?: number
              p_episode_title?: string
            }
        Returns: undefined
      }
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
