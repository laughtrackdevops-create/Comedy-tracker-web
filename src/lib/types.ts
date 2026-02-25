export interface Venue {
  id: string
  name: string
  city: string
  state: string
  address?: string
}

export interface Show {
  id: string
  user_id: string
  title: string
  performer: string
  venue_id: string
  venue?: Venue
  show_date: string
  status: 'want_to_see' | 'seen' | 'skipped'
  notes?: string
  created_at: string
  updated_at: string
}

export interface NewShow {
  title: string
  performer: string
  venue_id: string
  show_date: string
  status: Show['status']
  notes?: string
}
