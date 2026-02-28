import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import type { Show, Venue } from "../lib/types";
import VenuePicker from "../components/VenuePicker";

const PAGE_SIZE = 25;

export default function ShowsPage({ session }: { session: Session }) {
  const userId = session.user.id;

  const [shows, setShows] = useState<Show[]>([]);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Add Show form
  const [title, setTitle] = useState("");
  const [showDate, setShowDate] = useState("");
  const [venue, setVenue] = useState<Venue | null>(null);

  const canAdd = useMemo(() => !!showDate && !!venue, [showDate, venue]);

  async function loadShows(reset = false) {
    setErr(null);
    setBusy(true);
    try {
      const currentPage = reset ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("shows")
        .select("id,title,show_date,venue_id,venues(id,name,city)")
        .eq("user_id", userId)
        .order("show_date", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setShows((data as unknown as Show[]) ?? []);
      if (reset) setPage(0);
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setErr(e?.message ?? "Failed to load shows.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadShows(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addShow(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd || !venue) return;

    setErr(null);
    setBusy(true);
    try {
      const payload = {
        user_id: userId,
        title: title.trim() || null,
        show_date: new Date(showDate).toISOString(),
        venue_id: venue.id
      };

      const { error } = await supabase.from("shows").insert(payload);
      if (error) throw error;

      setTitle("");
      setShowDate("");
      setVenue(null);

      await loadShows(true);
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setErr(e?.message ?? "Failed to add show.");
    } finally {
      setBusy(false);
    }
  }

  async function nextPage() {
    const newPage = page + 1;
    setPage(newPage);
    setErr(null);
    setBusy(true);
    try {
      const from = newPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("shows")
        .select("id,title,show_date,venue_id,venues(id,name,city)")
        .eq("user_id", userId)
        .order("show_date", { ascending: false })
        .range(from, to);

      if (error) throw error;
      const rows = (data as unknown as Show[]) ?? [];
      if (rows.length === 0) {
        // no more data; revert page
        setPage((p) => Math.max(0, p - 1));
      } else {
        setShows(rows);
      }
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setErr(e?.message ?? "Failed to page.");
      setPage((p) => Math.max(0, p - 1));
    } finally {
      setBusy(false);
    }
  }

  async function prevPage() {
    const newPage = Math.max(0, page - 1);
    setPage(newPage);
    setErr(null);
    setBusy(true);
    try {
      const from = newPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("shows")
        .select("id,title,show_date,venue_id,venues(id,name,city)")
        .eq("user_id", userId)
        .order("show_date", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setShows((data as unknown as Show[]) ?? []);
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setErr(e?.message ?? "Failed to page.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <h2 style={{ margin: 0 }}>My Shows</h2>

      <form onSubmit={addShow} style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Add show</h3>

        <label>
          Title (optional)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Open mic / Feature / Headline"
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <label>
          Date & time
          <input
            value={showDate}
            onChange={(e) => setShowDate(e.target.value)}
            type="datetime-local"
            required
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <div>
          <div style={{ marginBottom: 6, fontWeight: 600 }}>Venue</div>
          <VenuePicker value={venue} onChange={setVenue} />
        </div>

        <button disabled={!canAdd || busy} style={{ padding: 12, cursor: "pointer" }}>
          {busy ? "Saving…" : "Add show"}
        </button>

        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => loadShows(true)} disabled={busy} style={{ padding: 10 }}>
          Refresh
        </button>
        <span style={{ fontSize: 13, color: "#666" }}>
          Page {page + 1} (max {PAGE_SIZE} rows)
        </span>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
        {shows.length === 0 ? (
          <div style={{ padding: 16 }}>No shows yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                  Date
                </th>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                  Title
                </th>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                  Venue
                </th>
              </tr>
            </thead>
            <tbody>
              {shows.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1", width: 210 }}>
                    {new Date(s.show_date).toLocaleString()}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                    {s.title ?? "—"}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                    {s.venues?.name ?? "—"}{" "}
                    <span style={{ color: "#666", fontSize: 13 }}>
                      {s.venues?.city ? `(${s.venues.city})` : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={prevPage} disabled={busy || page === 0} style={{ padding: 10 }}>
          Prev
        </button>
        <button onClick={nextPage} disabled={busy} style={{ padding: 10 }}>
          Next
        </button>
      </div>
    </div>
  );
}
