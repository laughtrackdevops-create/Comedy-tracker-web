import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Signup successful. Check your email if confirmation is enabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setMsg(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>{mode === "signup" ? "Create account" : "Log in"}</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>
        <button disabled={busy} style={{ padding: 10, cursor: "pointer" }}>
          {busy ? "Working…" : mode === "signup" ? "Sign up" : "Log in"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <div style={{ marginTop: 12 }}>
        {mode === "signup" ? (
          <button onClick={() => setMode("login")} style={{ cursor: "pointer" }}>
            Already have an account? Log in
          </button>
        ) : (
          <button onClick={() => setMode("signup")} style={{ cursor: "pointer" }}>
            New here? Create an account
          </button>
        )}
      </div>
    </div>
  );
}
