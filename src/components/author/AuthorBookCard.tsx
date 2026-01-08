import { Link } from "react-router-dom";
import type { AuthorBook } from "../../lib/api";

type AuthorBookCardProps = {
  book: AuthorBook;
};

export function AuthorBookCard({ book }: AuthorBookCardProps) {
  const coverStyle: React.CSSProperties = book.cover_url
    ? { backgroundImage: `url(${book.cover_url})` }
    : {};

  return (
    <div className="author-book-card">
      <div className="author-book-card__cover" style={coverStyle}>
        {!book.cover_url && (
          <span style={{ fontSize: 48, opacity: 0.3 }}>📖</span>
        )}
      </div>
      <div className="author-book-card__info">
        <div className="author-book-card__title">{book.title}</div>
        {book.published_year && (
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
            {book.published_year}
          </div>
        )}
        <Link to={`/author/books/${book.id}`} className="author-book-card__cta">
          Submit Tags
        </Link>
      </div>
    </div>
  );
}
