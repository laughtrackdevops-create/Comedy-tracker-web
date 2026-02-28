export type Venue = {
  id: string;
  name: string;
  city: string | null;
  created_at?: string;
  user_id?: string;
};

export type Show = {
  id: string;
  title: string | null;
  show_date: string; // ISO timestamp
  venue_id: string;
  created_at?: string;
  user_id?: string;
  venues?: Venue; // when joined
};
