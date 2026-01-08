import { useState, useEffect } from "react";
import { useAuthor } from "../../auth/AuthorContext";
import { getAuthorBooks, getAuthorSubmissions, type AuthorBook, type AuthorSubmission } from "../../lib/api";
import { AuthorBookCard } from "../../components/author/AuthorBookCard";

export function AuthorDashboard() {
  const { author } = useAuthor();
  const [books, setBooks] = useState<AuthorBook[]>([]);
  const [submissions, setSubmissions] = useState<AuthorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAuthorBooks(), getAuthorSubmissions()])
      .then(([booksRes, subsRes]) => {
        setBooks(booksRes.items);
        setSubmissions(subsRes.items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;

  const authorName = author && "display_name" in author && author.display_name
    ? author.display_name
    : author && "email" in author
    ? author.email.split("@")[0]
    : "Author";

  const authorEmail = author && "email" in author ? author.email : "";

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ opacity: 0.6 }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16, background: "#fee", borderRadius: 8, color: "#c00" }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="author-welcome">
        <h1 className="author-welcome__name">Welcome, {authorName}</h1>
        {authorEmail && <p className="author-welcome__email">{authorEmail}</p>}
      </div>

      <div className="author-stats">
        <div className="author-stat-card">
          <div className="author-stat-card__value">{books.length}</div>
          <div className="author-stat-card__label">Your Books</div>
        </div>
        <div className="author-stat-card">
          <div className="author-stat-card__value">{pendingCount}</div>
          <div className="author-stat-card__label">Pending</div>
        </div>
        <div className="author-stat-card">
          <div className="author-stat-card__value">{approvedCount}</div>
          <div className="author-stat-card__label">Approved</div>
        </div>
      </div>

      <h2 style={{ fontFamily: "var(--vault-font-serif)", fontSize: "1.5rem", marginBottom: 16 }}>
        Your Books
      </h2>

      {books.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No books found. Contact support if this seems incorrect.</p>
      ) : (
        <div className="author-books-grid">
          {books.map((book) => (
            <AuthorBookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
