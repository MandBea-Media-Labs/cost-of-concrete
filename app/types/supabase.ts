export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          password: string
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_profiles: {
        Row: {
          account_type: string
          created_at: string | null
          id: string
          is_admin: boolean | null
          metadata: Json
          updated_at: string | null
        }
        Insert: {
          account_type?: string
          created_at?: string | null
          id: string
          is_admin?: boolean | null
          metadata?: Json
          updated_at?: string | null
        }
        Update: {
          account_type?: string
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          metadata?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          coordinates: unknown
          created_at: string | null
          deleted_at: string | null
          id: string
          lat: number | null
          lng: number | null
          metadata: Json | null
          name: string
          slug: string
          state_code: string
          updated_at: string | null
        }
        Insert: {
          coordinates?: unknown
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          name: string
          slug: string
          state_code: string
          updated_at?: string | null
        }
        Update: {
          coordinates?: unknown
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          name?: string
          slug?: string
          state_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contractors: {
        Row: {
          city_id: string | null
          company_name: string
          coordinates: unknown
          created_at: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          google_cid: string | null
          google_place_id: string | null
          id: string
          images_processed: boolean
          lat: number | null
          lng: number | null
          metadata: Json | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          review_count: number | null
          slug: string
          status: string
          street_address: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          city_id?: string | null
          company_name: string
          coordinates?: unknown
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          google_cid?: string | null
          google_place_id?: string | null
          id?: string
          images_processed?: boolean
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          slug: string
          status?: string
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          city_id?: string | null
          company_name?: string
          coordinates?: unknown
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          google_cid?: string | null
          google_place_id?: string | null
          id?: string
          images_processed?: boolean
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          status?: string
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractors_city_id_fkey"
            columns: ["city_id"]
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_url: string | null
          deleted_at: string | null
          description: string | null
          display_order: number
          id: string
          is_enabled: boolean
          label: string
          link_type: string
          menu_id: string
          metadata: Json | null
          open_in_new_tab: boolean
          page_id: string | null
          parent_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_url?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          label: string
          link_type?: string
          menu_id: string
          metadata?: Json | null
          open_in_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_url?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          label?: string
          link_type?: string
          menu_id?: string
          metadata?: Json | null
          open_in_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_page_id_fkey"
            columns: ["page_id"]
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          display_order: number
          id: string
          is_enabled: boolean
          metadata: Json | null
          name: string
          show_in_footer: boolean
          show_in_header: boolean
          slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          metadata?: Json | null
          name: string
          show_in_footer?: boolean
          show_in_header?: boolean
          slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          metadata?: Json | null
          name?: string
          show_in_footer?: boolean
          show_in_header?: boolean
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      page_templates: {
        Row: {
          color: string
          component_name: string
          created_at: string | null
          created_by: string | null
          default_metadata: Json
          deleted_at: string | null
          description: string | null
          display_order: number
          id: string
          is_enabled: boolean
          is_system: boolean
          metadata_schema: Json
          name: string
          slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          color: string
          component_name: string
          created_at?: string | null
          created_by?: string | null
          default_metadata?: Json
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          is_system?: boolean
          metadata_schema?: Json
          name: string
          slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          color?: string
          component_name?: string
          created_at?: string | null
          created_by?: string | null
          default_metadata?: Json
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          is_system?: boolean
          metadata_schema?: Json
          name?: string
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }

      pages: {
        Row: {
          canonical_url: string | null
          content: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          depth: number
          description: string | null
          focus_keyword: string | null
          full_path: string
          id: string
          meta_keywords: string[] | null
          meta_robots: string[] | null
          meta_title: string | null
          metadata: Json | null
          og_image: string | null
          parent_id: string | null
          published_at: string | null
          redirect_type: number | null
          redirect_url: string | null
          sitemap_changefreq: string | null
          sitemap_priority: number | null
          slug: string
          status: string
          template: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          depth?: number
          description?: string | null
          focus_keyword?: string | null
          full_path: string
          id?: string
          meta_keywords?: string[] | null
          meta_robots?: string[] | null
          meta_title?: string | null
          metadata?: Json | null
          og_image?: string | null
          parent_id?: string | null
          published_at?: string | null
          redirect_type?: number | null
          redirect_url?: string | null
          sitemap_changefreq?: string | null
          sitemap_priority?: number | null
          slug: string
          status?: string
          template?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          depth?: number
          description?: string | null
          focus_keyword?: string | null
          full_path?: string
          id?: string
          meta_keywords?: string[] | null
          meta_robots?: string[] | null
          meta_title?: string | null
          metadata?: Json | null
          og_image?: string | null
          parent_id?: string | null
          published_at?: string | null
          redirect_type?: number | null
          redirect_url?: string | null
          sitemap_changefreq?: string | null
          sitemap_priority?: number | null
          slug?: string
          status?: string
          template?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          display_order: number
          icon: string | null
          id: string
          is_enabled: boolean
          metadata: Json | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_enabled?: boolean
          metadata?: Json | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_enabled?: boolean
          metadata?: Json | null
          name?: string
          slug?: string
          updated_at?: string | null
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
  storage: {
    Tables: {
      [_ in never]: never
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

