import { useEffect, useState } from "react";
import { getRecommendations, type RecommendationsResponse, type BookListItem } from "../lib/api";
import { useMe } from "../auth/MeContext";
import BookCard from "../components/BookCard";
import BookActions from "../components/BookActions";

export default function RecommendationsPage() {
  const { isLoading: meLoading, isAuthenticated, isPaid, requireAuth, requirePaid } = useMe();

  const [data, setData] = useState<RecommendationsResponse | null>(null);
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
        const res = await getRecommendations();
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load recommendations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [canLoad]);

  // Normalize books from response (supports both formats)
  function getBooks(): BookListItem[] {
    if (!data) return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.recommendations)) {
      return data.recommendations.map((r) => r.book);
    }
    return [];
  }

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
        <h2 style={{ marginBottom: 12 }}>Recommendations</h2>
        <p style={{ marginBottom: 16, opacity: 0.7 }}>Sign in to see personalized recommendations.</p>
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
        <h2 style={{ marginBottom: 12 }}>Recommendations</h2>
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

  const books = getBooks();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Recommendations</h2>
        {data?.message && (
          <p style={{ marginTop: 8, opacity: 0.7, fontSize: 14 }}>{data.message}</p>
        )}
      </div>

      {err && (
        <div style={{ padding: 16, background: "#fee", borderRadius: 8, color: "#c00", marginBottom: 16 }}>
          {err}
        </div>
      )}

      {loading && <div style={{ padding: 24, textAlign: "center", opacity: 0.6 }}>Loading...</div>}

      {!loading && !err && books.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", opacity: 0.6 }}>
          No recommendations yet. Try adding some tag preferences!
        </div>
      )}

      {!loading && !err && books.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {books.map((book) => (
            <div key={book.id} style={{ position: "relative" }}>
              <BookCard book={book} />
              <div style={{ marginTop: 8 }}>
                <BookActions bookId={book.id} compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
