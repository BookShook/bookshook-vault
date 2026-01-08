import { Link } from "react-router-dom";
import { ChevronDown, Flame } from "lucide-react";

// Featured book for the entrance - replace with real data
const FEATURED_BOOK = {
  title: "The Love Hypothesis",
  author: "Ali Hazelwood",
  coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611937942i/56732449.jpg",
  tags: ["Fake Dating", "Grumpy/Sunshine", "Academic Setting"],
  heat: 3,
  quote: "I finished this at 2am and texted three people.",
  marginalia: "The grovel in chapter 24 should be studied in universities.",
};

// More featured books for the reveal section
const MORE_FEATURED = [
  {
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1651588954i/58950447.jpg",
    note: "Enemies who actually hate each other. Finally.",
  },
  {
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638867089i/59386369.jpg",
    note: "The tension made me put my phone down and walk away.",
  },
  {
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1635194220i/55650627.jpg",
    note: "He was so mean for political reasons and I lived.",
  },
];

function HeatLevel({ level }: { level: number }) {
  return (
    <div className="door__heat">
      {[1, 2, 3, 4, 5].map((i) => (
        <Flame
          key={i}
          size={16}
          className={i <= level ? "heat__flame--active" : ""}
          style={{ opacity: i <= level ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
}

export default function TheDoor() {
  return (
    <div className="door">
      {/* Above the fold - The Entrance */}
      <section className="door__entrance">
        <p className="door__quote">"{FEATURED_BOOK.quote}"</p>

        <div className="door__book">
          <div className="door__book-glow" />
          <img
            src={FEATURED_BOOK.coverUrl}
            alt={FEATURED_BOOK.title}
            className="door__book-cover"
          />
        </div>

        <div className="door__book-info">
          <h2 className="door__book-title">{FEATURED_BOOK.title}</h2>
          <p className="door__book-author">by {FEATURED_BOOK.author}</p>

          <div className="door__book-tags">
            {FEATURED_BOOK.tags.map((tag) => (
              <span key={tag} className="door__tag">
                {tag}
              </span>
            ))}
          </div>

          <HeatLevel level={FEATURED_BOOK.heat} />
        </div>

        <p className="door__marginalia">"{FEATURED_BOOK.marginalia}"</p>

        <div className="door__cta">
          <Link to="/books" className="door__enter">
            Come inside
          </Link>
        </div>

        <div className="door__scroll-hint">
          <span>Scroll to explore</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Below the fold - The Reveal */}
      <section className="door__reveal">
        <div className="door__intro">
          <p className="door__intro-text">
            This is <strong>BookShook</strong>. I read 350 books a year so you
            don't waste a single night on the wrong one.
          </p>
        </div>

        <div className="door__featured">
          {MORE_FEATURED.map((book, i) => (
            <div key={i} className="door__featured-book">
              <img
                src={book.coverUrl}
                alt="Featured book"
                className="door__featured-cover"
              />
              <p className="door__featured-note">{book.note}</p>
            </div>
          ))}
        </div>

        <div className="door__promise">
          <p className="door__promise-text">
            Every book tagged. Every warning visible. Every recommendation earned.
          </p>
        </div>

        <div className="door__final-cta">
          <a
            href="https://bookshook.com/#/portal/signup"
            className="door__subscribe"
          >
            Enter the Vault — $5.99/mo
          </a>
          <p className="door__free-note">
            Or just stay for the free Friday picks.
          </p>
        </div>
      </section>
    </div>
  );
}
