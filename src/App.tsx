import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import AuthPage from './pages/AuthPage'
import ShowsPage from './pages/ShowsPage'
import Navbar from './components/Navbar'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {session && <Navbar session={session} />}
      <Routes>
        <Route
          path="/auth"
          element={session ? <Navigate to="/shows" replace /> : <AuthPage />}
        />
        <Route
          path="/shows"
          element={session ? <ShowsPage session={session} /> : <Navigate to="/auth" replace />}
        />
        <Route path="*" element={<Navigate to={session ? '/shows' : '/auth'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
