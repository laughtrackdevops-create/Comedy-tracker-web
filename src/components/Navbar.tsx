import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface NavbarProps {
  session: Session
}

export default function Navbar({ session }: NavbarProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1a1a2e',
      color: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
        🎤 Comedy Tracker
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          {session.user.email}
        </span>
        <button
          onClick={handleSignOut}
          style={{
            padding: '0.375rem 0.875rem',
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
