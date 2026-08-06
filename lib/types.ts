export type ProfileRole = 'user' | 'business' | 'admin' | 'super_admin';

export type BusinessStatus = 'pending' | 'approved' | 'rejected' | 'deactivated' | 'suspended';
export type PaymentStatus = 'none' | 'active' | 'expired';
export type ProfileType = 'registered' | 'independent';

export interface Category {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  icon: string | null;
}

export interface Business {
  id: string;
  owner_id: string | null;
  name: string;
  profile_type: ProfileType;
  category_id: string | null;
  city: string | null;
  region: string | null;
  community: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  status: BusinessStatus;
  payment_status: PaymentStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
}

export interface Review {
  id: string;
  business_id: string;
  author_id: string;
  rating: number;
  comment: string | null;
  status: 'visible' | 'flagged' | 'removed';
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: ProfileRole;
  phone: string | null;
  avatar_url: string | null;
  preferred_locale: 'fr' | 'en' | null;
  email_notifications: boolean;
  created_at: string;
}

export interface BusinessDocument {
  id: string;
  business_id: string;
  file_path: string;
  doc_type: string;
  created_at: string;
  signedUrl?: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
  businesses?: Business | null;
}

export interface Message {
  id: string;
  business_id: string | null;
  sender_id: string | null;
  sender_name: string | null;
  sender_email: string | null;
  content: string;
  status: 'unread' | 'read';
  reply_content: string | null;
  replied_at: string | null;
  created_at: string;
}
