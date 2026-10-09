// Types de la base Bâtiplace. À régénérer avec `supabase gen types typescript`
// une fois le projet créé ; écrits à la main d'après supabase/migrations.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SellerType = 'particulier' | 'entrepreneur' | 'fournisseur' | 'entreprise';
export type ListingCondition = 'neuf' | 'usage' | 'surplus';
export type ListingStatus = 'active' | 'vendue' | 'retiree';

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    isOneToOne?: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[];
};

export type Category = { id: string; name: string; position: number };

export type Profile = {
  id: string;
  display_name: string;
  seller_type: SellerType;
  city: string | null;
  rbq_license: string | null;
  rbq_verified: boolean;
  avatar_url: string | null;
  created_at: string;
};

export type Subscription = {
  user_id: string;
  is_active: boolean;
  store: string | null;
  product_id: string | null;
  expires_at: string | null;
  updated_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category_id: string;
  condition: ListingCondition;
  price_cents: number;
  price_unit: string;
  quantity: string;
  spec: string;
  city: string;
  location: unknown;
  status: ListingStatus;
  boost_kind: string | null;
  boost_until: string | null;
  views: number;
  created_at: string;
  updated_at: string;
};

export type ListingInsert = {
  title: string;
  description?: string;
  category_id: string;
  condition: ListingCondition;
  price_cents: number;
  price_unit?: string;
  quantity?: string;
  spec?: string;
  city: string;
  location: string;
  status?: ListingStatus;
};

export type ListingPhoto = { id: string; listing_id: string; path: string; position: number };
export type Favorite = { user_id: string; listing_id: string; created_at: string };

export type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  last_message_at: string;
};

export type Message = {
  id: number;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type Review = {
  id: string;
  seller_id: string;
  author_id: string;
  rating: number;
  body: string;
  created_at: string;
};

export type SearchResult = {
  id: string;
  title: string;
  price_cents: number;
  price_unit: string;
  spec: string;
  city: string;
  condition: ListingCondition;
  category_id: string;
  seller_id: string;
  seller_type: SellerType;
  created_at: string;
  boost_kind: string | null;
  boosted: boolean;
  distance_km: number;
  photo_path: string | null;
};

/** Public columns of a partner merchant. promo_code is only given to subscribers, through partner_promo_code(). */
export type Partner = {
  id: string;
  name: string;
  offer: string;
  description: string;
  category: string;
  city: string;
  address: string;
  website: string;
  phone: string;
  email: string;
  logo_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};

/** Public columns of an approved contractor (contact_name, email and message stay private). */
export type Contractor = {
  id: string;
  company_name: string;
  phone: string;
  city: string;
  rbq_license: string;
  specialties: string;
  website: string;
  approved: boolean;
  rbq_verified: boolean;
  sort_order: number;
  created_at: string;
};

export type ContractorRequest = {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  city?: string;
  rbq_license?: string;
  specialties?: string;
  website?: string;
  message?: string;
};

export type Database = {
  public: {
    Tables: {
      categories: Table<Category>;
      profiles: Table<Profile, Partial<Profile> & { id: string }>;
      subscriptions: Table<Subscription>;
      listings: Table<Listing, ListingInsert, Partial<ListingInsert>>;
      listing_photos: Table<ListingPhoto, { listing_id: string; path: string; position?: number }>;
      favorites: Table<Favorite, { listing_id: string; user_id?: string }>;
      conversations: Table<Conversation, { listing_id: string; seller_id: string; buyer_id?: string }>;
      messages: Table<Message, { conversation_id: string; body: string; sender_id?: string }, { read_at?: string | null }>;
      reviews: Table<Review, { seller_id: string; rating: number; body?: string; author_id?: string }>;
      partners: Table<Partner>;
      contractor_requests: Table<Contractor, ContractorRequest, never>;
    };
    Views: {
      seller_ratings: {
        Row: { seller_id: string; average: number; count: number };
        Relationships: [];
      };
    };
    Functions: {
      search_listings: {
        Args: {
          lat: number;
          lng: number;
          radius_km?: number;
          q?: string | null;
          categories?: string[] | null;
          conditions?: ListingCondition[] | null;
          pro_only?: boolean | null;
          sort?: string;
          page_size?: number;
          page?: number;
        };
        Returns: SearchResult[];
      };
      increment_listing_view: { Args: { listing: string }; Returns: undefined };
      has_active_subscription: { Args: { uid: string }; Returns: boolean };
      partner_promo_code: { Args: { partner: string }; Returns: string | null };
    };
    Enums: {
      seller_type: SellerType;
      listing_condition: ListingCondition;
      listing_status: ListingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
