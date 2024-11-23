export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  is_public: boolean;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  category: string;
  tags: { [key: string]: string[] } | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagGroup {
  id: string;
  user_id: string;
  name: string;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      galleries: {
        Row: Gallery;
        Insert: Omit<Gallery, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Gallery, 'id' | 'created_at' | 'updated_at'>>;
      };
      videos: {
        Row: Video;
        Insert: Omit<Video, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Video, 'id' | 'created_at' | 'updated_at'>>;
      };
      tag_groups: {
        Row: TagGroup;
        Insert: Omit<TagGroup, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TagGroup, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}