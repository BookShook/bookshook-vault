import { Link } from "react-router-dom";
import type { BookListItem } from "../lib/api";
import BookActions from "./BookActions";

type Props = {
  book: BookListItem;
};

function TagPill({ name }: { name: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 6px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,.12)",
        background: "rgba(0,0,0,.03)",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </span>
  );
}

export default function BookCard({ book }: Props) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,.1)",
        borderRadius: 12,
        overflow: "hidden",
        background: "white",
        transition: "box-shadow 160ms ease, transform 160ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,.10)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Clickable content area */}
      <Link
        to={`/books/${book.slug}`}
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            aspectRatio: "2/3",
            background: book.coverUrl
              ? `url(${book.coverUrl}) center/cover`
              : "linear-gradient(135deg, #e0e0e0, #f5f5f5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!book.coverUrl && <span style={{ fontSize: 48, opacity: 0.3 }}>📖</span>}
        </div>

        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>
            {book.title}
          </div>

          {book.authors?.length > 0 && (
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
              {book.authors.map((a) => a.name).join(", ")}
            </div>
          )}

          {book.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {book.tags.slice(0, 3).map((tag) => (
                <TagPill key={tag.id} name={tag.name} />
              ))}
              {book.tags.length > 3 && (
                <span style={{ fontSize: 10, opacity: 0.5 }}>+{book.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Action area (NOT inside the Link, so clicks won't navigate) */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,.08)",
          padding: "10px 12px",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <BookActions bookId={book.id} compact />
      </div>
    </div>
  );
}
