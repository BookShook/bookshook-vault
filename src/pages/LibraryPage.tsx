import { useEffect, useState } from "react";
import { getMyLibrary, type MyLibraryResponse } from "../lib/api";
import { useMe } from "../auth/MeContext";
import BookCard from "../components/BookCard";
import BookActions from "../components/BookActions";

export default function LibraryPage() {
  const { isLoading: meLoading, isAuthenticated, isPaid, requireAuth, requirePaid } = useMe();

  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MyLibraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canLoad = !meLoading && isAuthenticated && isPaid;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!canLoad) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await getMyLibrary({ filter, page, pageSize: 24 });
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load library");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [canLoad, filter, page]);

  if (meLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", opacity: 0.6 }}>Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          border: "1px solid rgba(0,0,0,.1)",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>My Library</h2>
        <p style={{ marginBottom: 16, opacity: 0.7 }}>Sign in to view your saved books.</p>
        <button
          onClick={requireAuth}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          border: "1px solid rgba(0,0,0,.1)",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>My Library</h2>
        <p style={{ marginBottom: 16, opacity: 0.7 }}>This is a Premium feature.</p>
        <button
          onClick={requirePaid}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>My Library</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 13 }}>
            Filter:
            <select
              value={filter}
              onChange={(e) => {
                setPage(1);
                setFilter(e.target.value);
              }}
              style={{
                marginLeft: 8,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid rgba(0,0,0,.15)",
              }}
            >
              <option value="all">All</option>
              <option value="heart">Hearts</option>
              <option value="save">Saved</option>
              <option value="tbr">TBR</option>
            </select>
          </label>
        </div>
      </div>

      {err && (
        <div style={{ padding: 16, background: "#fee", borderRadius: 8, color: "#c00", marginBottom: 16 }}>
          {err}
        </div>
      )}

      {loading && <div style={{ padding: 24, textAlign: "center", opacity: 0.6 }}>Loading...</div>}

      {!loading && !err && items.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", opacity: 0.6 }}>
          No books in your library yet.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {items.map((row) => {
              const book = row.book;
              return (
                <div key={book.id} style={{ position: "relative" }}>
                  <BookCard book={book} />
                  <div style={{ marginTop: 8 }}>
                    <BookActions bookId={book.id} compact />
                  </div>
                </div>
              );
            })}
          </div>

          {data && data.totalPages > 1 && (
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(0,0,0,.15)",
                  background: "#fff",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                Prev
              </button>
              <span style={{ padding: "6px 12px", fontSize: 14 }}>
                Page {data.page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(0,0,0,.15)",
                  background: "#fff",
                  cursor: page >= data.totalPages ? "not-allowed" : "pointer",
                  opacity: page >= data.totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
