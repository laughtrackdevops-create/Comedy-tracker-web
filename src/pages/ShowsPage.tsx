import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { Show, NewShow } from '../lib/types'
import VenuePicker from '../components/VenuePicker'

interface ShowsPageProps {
  session: Session
}

const STATUS_LABELS: Record<Show['status'], string> = {
  want_to_see: 'Want to See',
  seen: 'Seen',
  skipped: 'Skipped',
}

const STATUS_COLORS: Record<Show['status'], string> = {
  want_to_see: '#3498db',
  seen: '#27ae60',
  skipped: '#95a5a6',
}

const emptyForm: NewShow = {
  title: '',
  performer: '',
  venue_id: '',
  show_date: '',
  status: 'want_to_see',
  notes: '',
}

export default function ShowsPage({ session }: ShowsPageProps) {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewShow>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Show['status'] | 'all'>('all')

  useEffect(() => {
    loadShows()
  }, [])

  async function loadShows() {
    const { data, error } = await supabase
      .from('shows')
      .select('*, venue:venues(*)')
      .eq('user_id', session.user.id)
      .order('show_date', { ascending: false })

    if (error) {
      setError('Failed to load shows')
    } else {
      setShows(data ?? [])
    }
    setLoading(false)
  }

  async function handleAddShow(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('shows').insert({
      ...form,
      user_id: session.user.id,
    })

    if (error) {
      setError('Failed to save show: ' + error.message)
    } else {
      setForm(emptyForm)
      setShowForm(false)
      await loadShows()
    }
    setSaving(false)
  }

  async function handleStatusChange(showId: string, status: Show['status']) {
    const { error } = await supabase
      .from('shows')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', showId)

    if (!error) {
      setShows((prev) =>
        prev.map((s) => (s.id === showId ? { ...s, status } : s))
      )
    }
  }

  async function handleDelete(showId: string) {
    if (!confirm('Delete this show?')) return
    const { error } = await supabase.from('shows').delete().eq('id', showId)
    if (!error) {
      setShows((prev) => prev.filter((s) => s.id !== showId))
    }
  }

  const filteredShows = filter === 'all' ? shows : shows.filter((s) => s.status === filter)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#1a1a2e' }}>My Shows</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Show'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddShow}
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Add New Show</h2>

          {error && (
            <div style={{ color: '#c0392b', backgroundColor: '#fde8e8', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Show Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Special Comedy Night"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Performer</label>
              <input
                value={form.performer}
                onChange={(e) => setForm({ ...form, performer: e.target.value })}
                required
                placeholder="e.g. Dave Chappelle"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Venue</label>
              <VenuePicker value={form.venue_id} onChange={(id) => setForm({ ...form, venue_id: id })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Show Date</label>
              <input
                type="date"
                value={form.show_date}
                onChange={(e) => setForm({ ...form, show_date: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Show['status'] })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }}
            >
              <option value="want_to_see">Want to See</option>
              <option value="seen">Seen</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Any notes about the show..."
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#27ae60',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Show'}
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['all', 'want_to_see', 'seen', 'skipped'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.375rem 0.875rem',
              border: '1px solid #ddd',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              backgroundColor: filter === f ? '#1a1a2e' : '#fff',
              color: filter === f ? '#fff' : '#333',
            }}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading shows...</p>
      ) : filteredShows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <p style={{ fontSize: '1.1rem' }}>No shows yet.</p>
          <p style={{ fontSize: '0.9rem' }}>Click "+ Add Show" to track a comedy show!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredShows.map((show) => (
            <div
              key={show.id}
              style={{
                backgroundColor: '#fff',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a1a2e' }}>{show.title}</h3>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px',
                    backgroundColor: STATUS_COLORS[show.status] + '22',
                    color: STATUS_COLORS[show.status],
                    fontWeight: 600,
                  }}>
                    {STATUS_LABELS[show.status]}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#555' }}>
                  {show.performer}
                  {show.venue && ` • ${show.venue.name}, ${show.venue.city}`}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>
                  {new Date(show.show_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {show.notes && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#777', fontStyle: 'italic' }}>{show.notes}</p>}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                <select
                  value={show.status}
                  onChange={(e) => handleStatusChange(show.id, e.target.value as Show['status'])}
                  style={{ fontSize: '0.8rem', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="want_to_see">Want to See</option>
                  <option value="seen">Seen</option>
                  <option value="skipped">Skipped</option>
                </select>
                <button
                  onClick={() => handleDelete(show.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
