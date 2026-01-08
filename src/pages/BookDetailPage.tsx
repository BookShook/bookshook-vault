import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookBySlug, type BookDetail } from "../lib/api";

export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getBookBySlug(slug)
      .then((data) => setBook(data.book))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div style={{ padding: 24, textAlign: "center", opacity: 0.6 }}>Loading…</div>;
  }

  if (error || !book) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ color: "red", marginBottom: 12 }}>{error ?? "Book not found"}</div>
        <Link to="/books" style={{ color: "#000" }}>
          ← Back to books
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link to="/books" style={{ fontSize: 14, color: "#000", opacity: 0.7, textDecoration: "none" }}>
        ← Back to books
      </Link>

      <div style={{ marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Cover */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            aspectRatio: "2/3",
            borderRadius: 12,
            background: book.coverUrl
              ? `url(${book.coverUrl}) center/cover`
              : "linear-gradient(135deg, #e0e0e0, #f5f5f5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!book.coverUrl && <span style={{ fontSize: 64, opacity: 0.3 }}>📖</span>}
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{book.title}</h1>

          {book.subtitle && (
            <div style={{ fontSize: 16, opacity: 0.7, marginTop: 4 }}>{book.subtitle}</div>
          )}

          {book.authors.length > 0 && (
            <div style={{ fontSize: 14, marginTop: 12 }}>
              <strong>By:</strong> {book.authors.map((a) => a.name).join(", ")}
            </div>
          )}

          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 13, opacity: 0.8 }}>
            {book.publishedYear && <span>Published: {book.publishedYear}</span>}
            {book.pageCount && <span>{book.pageCount} pages</span>}
          </div>

          {book.description && (
            <p style={{ marginTop: 16, lineHeight: 1.6, opacity: 0.9 }}>{book.description}</p>
          )}

          {/* Tags */}
          {book.tags.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {book.tags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(0,0,0,.06)",
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div style={{ marginTop: 24, fontSize: 11, opacity: 0.5 }}>
            Added: {new Date(book.createdAt).toLocaleDateString()}
            {book.updatedAt !== book.createdAt && (
              <> · Updated: {new Date(book.updatedAt).toLocaleDateString()}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
