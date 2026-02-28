import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Venue } from "../lib/types";

export default function VenuePicker({
  value,
  onChange
}: {
  value: Venue | null;
  onChange: (v: Venue) => void;
}) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<Venue[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!canSearch) {
        setResults([]);
        return;
      }
      setBusy(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("id,name,city")
          .ilike("name", `%${q.trim()}%`)
          .order("name", { ascending: true })
          .limit(10);

        if (error) throw error;
        setResults((data as Venue[]) ?? []);
      } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        setErr(e?.message ?? "Venue search failed.");
      } finally {
        setBusy(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q, canSearch]);

  async function createVenue() {
    setErr(null);
    const name = q.trim();
    const cityClean = city.trim() || null;
    if (name.length < 2) return;

    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("venues")
        .insert({ name, city: cityClean })
        .select("id,name,city")
        .single();

      if (error) throw error;
      onChange(data as Venue);
      setResults([]);
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setErr(e?.message ?? "Create venue failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Venue name
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g., The Comedy Cellar"
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <label>
          City (optional)
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., New York"
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={createVenue} disabled={busy} style={{ padding: 10 }}>
            + Create venue
          </button>
          {busy && <span style={{ fontSize: 13, color: "#666" }}>Working…</span>}
        </div>

        {err && <div style={{ color: "crimson" }}>{err}</div>}

        {results.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>Matches</div>
            <div style={{ display: "grid", gap: 6 }}>
              {results.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => onChange(v)}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{v.name}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>{v.city ?? "—"}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {value && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
            Selected: <b>{value.name}</b> {value.city ? `(${value.city})` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
