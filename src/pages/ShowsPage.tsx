import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { Show } from "../lib/types";
import VenuePicker from "../components/VenuePicker";

interface ShowsPageProps {
  session: Session;
}

interface NewShow {
  title: string;
  venue_id: string;
  show_date: string;
}

const emptyForm: NewShow = {
  title: "",
  venue_id: "",
  show_date: "",
};

export default function ShowsPage({ session }: ShowsPageProps) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewShow>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadShows(); }, []);

  async function loadShows() {
    const { data, error } = await supabase
      .from("shows")
      .select("*, venues(*)")
      .eq("user_id", session.user.id)
      .order("show_date", { ascending: false });

    if (error) {
      setError("Failed to load shows");
    } else {
      setShows(data ?? []);
    }
    setLoading(false);
  }

  async function handleAddShow(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("shows").insert({
      ...form,
      user_id: session.user.id,
    });

    if (error) {
      setError("Failed to save show: " + error.message);
    } else {
      setForm(emptyForm);
      setShowForm(false);
      await loadShows();
    }
    setSaving(false);
  }

  async function handleDelete(showId: string) {
    if (!confirm("Delete this show?")) return;
    const { error } = await supabase.from("shows").delete().eq("id", showId);
    if (!error) {
      setShows((prev) => prev.filter((s) => s.id !== showId));
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ margin: 0, color: "#1a1a2e" }}>My Shows</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#1a1a2e",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Add Show"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddShow}
          style={{
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>
            Add New Show
          </h2>

          {error && (
            <div
              style={{
                color: "#c0392b",
                backgroundColor: "#fde8e8",
                padding: "0.75rem",
                borderRadius: "4px",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Show Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Special Comedy Night"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Show Date
              </label>
              <input
                type="date"
                value={form.show_date}
                onChange={(e) =>
                  setForm({ ...form, show_date: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Venue
            </label>
            <VenuePicker
              value={form.venue_id}
              onChange={(id) => setForm({ ...form, venue_id: id })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.6rem 1.25rem",
              backgroundColor: "#27ae60",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Show"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading shows...</p>
      ) : shows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
          <p style={{ fontSize: "1.1rem" }}>No shows yet.</p>
          <p style={{ fontSize: "0.9rem" }}>
            Click "+ Add Show" to track a comedy show!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {shows.map((show) => (
            <div
              key={show.id}
              style={{
                backgroundColor: "#fff",
                padding: "1rem 1.25rem",
                borderRadius: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 0.25rem",
                    fontSize: "1rem",
                    color: "#1a1a2e",
                  }}
                >
                  {show.title ?? "(Untitled)"}
                </h3>
                {show.venues && (
                  <p
                    style={{
                      margin: "0 0 0.25rem",
                      fontSize: "0.9rem",
                      color: "#555",
                    }}
                  >
                    {show.venues.name}
                    {show.venues.city ? `, ${show.venues.city}` : ""}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#999" }}>
                  {new Date(show.show_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <button
                onClick={() => handleDelete(show.id)}
                style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  flexShrink: 0,
                  marginLeft: "1rem",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
