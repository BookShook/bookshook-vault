import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuthorBooks, getAuthorSubmissions, type AuthorBook, type AuthorSubmission } from "../../lib/api";
import { TagSubmissionForm } from "../../components/author/TagSubmissionForm";
import { SubmissionCard } from "../../components/author/SubmissionCard";

export function AuthorBookDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<AuthorBook | null>(null);
  const [submissions, setSubmissions] = useState<AuthorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!bookId) return;

    try {
      const [booksRes, subsRes] = await Promise.all([
        getAuthorBooks(),
        getAuthorSubmissions(),
      ]);

      const foundBook = booksRes.items.find((b) => b.id === bookId);
      if (!foundBook) {
        setError("Book not found or you don't have access to it");
        setLoading(false);
        return;
      }

      setBook(foundBook);
      setSubmissions(subsRes.items.filter((s) => s.book_id === bookId));
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bookId]);

  const handleSubmissionSuccess = () => {
    // Reload submissions after successful submit
    getAuthorSubmissions().then((res) => {
      setSubmissions(res.items.filter((s) => s.book_id === bookId));
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ opacity: 0.6 }}>Loading...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div>
        <Link to="/author" style={{ color: "var(--vault-teal)", marginBottom: 16, display: "inline-block" }}>
          &larr; Back to Dashboard
        </Link>
        <div style={{ padding: 16, background: "#fee", borderRadius: 8, color: "#c00" }}>
          {error || "Book not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/author" style={{ color: "var(--vault-teal)", marginBottom: 16, display: "inline-block" }}>
        &larr; Back to Dashboard
      </Link>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <div
          style={{
            width: 150,
            aspectRatio: "2 / 3",
            background: book.cover_url
              ? `url(${book.cover_url}) center/cover`
              : "linear-gradient(135deg, var(--vault-plum) 0%, var(--vault-plum-mid) 100%)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {!book.cover_url && <span style={{ fontSize: 48, opacity: 0.3 }}>📖</span>}
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--vault-font-serif)", fontSize: "1.75rem", margin: 0 }}>
            {book.title}
          </h1>
          {book.published_year && (
            <p style={{ opacity: 0.6, margin: "8px 0 0" }}>{book.published_year}</p>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <TagSubmissionForm bookId={book.id} onSuccess={handleSubmissionSuccess} />
        </div>

        <div>
          <h3 style={{ fontFamily: "var(--vault-font-serif)", fontSize: "1.25rem", marginBottom: 16 }}>
            Your Submissions for This Book
          </h3>
          {submissions.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No submissions yet. Use the form to submit tags.</p>
          ) : (
            submissions.map((sub) => <SubmissionCard key={sub.id} submission={sub} />)
          )}
        </div>
      </div>
    </div>
  );
}
