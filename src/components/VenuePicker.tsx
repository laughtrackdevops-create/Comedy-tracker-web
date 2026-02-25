import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Venue } from '../lib/types'

interface VenuePickerProps {
  value: string
  onChange: (venueId: string) => void
}

export default function VenuePicker({ value, onChange }: VenuePickerProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVenues() {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')

      if (error) {
        setError('Failed to load venues')
      } else {
        setVenues(data ?? [])
      }
      setLoading(false)
    }

    loadVenues()
  }, [])

  if (loading) return <select disabled><option>Loading venues...</option></select>
  if (error) return <select disabled><option>{error}</option></select>

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1rem',
        backgroundColor: '#fff',
      }}
    >
      <option value="">Select a venue...</option>
      {venues.map((venue) => (
        <option key={venue.id} value={venue.id}>
          {venue.name} — {venue.city}, {venue.state}
        </option>
      ))}
    </select>
  )
}
