import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import ShowsPage from "./pages/ShowsPage";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <Navbar session={session} />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        {session ? <ShowsPage session={session} /> : <AuthPage />}
      </div>
    </div>
  );
}
