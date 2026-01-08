import { Link } from "react-router-dom";
import { Flame, Clock, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Mock data - replace with API
const CURRENT_PICK = {
  title: "The Love Hypothesis",
  author: "Ali Hazelwood",
  slug: "the-love-hypothesis",
  coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611937942i/56732449.jpg",
  tags: ["Fake Dating", "Grumpy/Sunshine", "Academic Setting", "STEM Romance"],
  heat: 3,
  pageCount: 384,
  readTime: "6-8 hours",
  publishedDate: "January 3, 2026",
  quote: "I finished this at 2am and texted three people.",
  marginalia: [
    "The grovel in chapter 24 should be studied in universities.",
    "Adam Carlsen said 'I know' and I had to put my phone down.",
    "The fake dating turning real hit different at 2am.",
  ],
  whyThisWeek: "Because sometimes you need a competent, brooding man in a lab coat who doesn't know how to express emotions until chapter 20. This book single-handedly launched the STEM romance boom, and for good reason.",
  contentWarnings: ["Anxiety representation", "Academic pressure", "Light spice (closed door adjacent)"],
  perfectFor: ["Fake dating addicts", "Academia lovers", "Those who need a comfort reread"],
};

const PAST_PICKS = [
  {
    title: "Book Lovers",
    author: "Emily Henry",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1651588954i/58950447.jpg",
    date: "Dec 27, 2025",
  },
  {
    title: "People We Meet on Vacation",
    author: "Emily Henry",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638867089i/59386369.jpg",
    date: "Dec 20, 2025",
  },
  {
    title: "The Spanish Love Deception",
    author: "Elena Armas",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1635194220i/55650627.jpg",
    date: "Dec 13, 2025",
  },
];

function HeatLevel({ level }: { level: number }) {
  return (
    <div className="friday__heat">
      {[1, 2, 3, 4, 5].map((i) => (
        <Flame
          key={i}
          size={20}
          className={i <= level ? "heat__flame--active" : ""}
          style={{ opacity: i <= level ? 1 : 0.3 }}
        />
      ))}
      <span className="friday__heat-label">
        {level <= 2 ? "Sweet" : level <= 3 ? "Steamy" : level <= 4 ? "Spicy" : "Scorching"}
      </span>
    </div>
  );
}

export default function FridayPickPage() {
  const [activeNote, setActiveNote] = useState(0);

  return (
    <div className="friday">
      {/* Hero Section */}
      <section className="friday__hero">
        <div className="friday__hero-bg" style={{ backgroundImage: `url(${CURRENT_PICK.coverUrl})` }} />

        <div className="friday__hero-content">
          <div className="friday__date">
            <span className="friday__date-label">Friday Pick</span>
            <span className="friday__date-value">{CURRENT_PICK.publishedDate}</span>
          </div>

          <div className="friday__book-display">
            <div className="friday__cover-wrapper">
              <div className="friday__cover-glow" />
              <img
                src={CURRENT_PICK.coverUrl}
                alt={CURRENT_PICK.title}
                className="friday__cover"
              />
            </div>

            <div className="friday__book-info">
              <h1 className="friday__title">{CURRENT_PICK.title}</h1>
              <p className="friday__author">by {CURRENT_PICK.author}</p>

              <div className="friday__tags">
                {CURRENT_PICK.tags.map((tag) => (
                  <span key={tag} className="friday__tag">{tag}</span>
                ))}
              </div>

              <HeatLevel level={CURRENT_PICK.heat} />

              <div className="friday__meta">
                <span className="friday__meta-item">
                  <BookOpen size={16} />
                  {CURRENT_PICK.pageCount} pages
                </span>
                <span className="friday__meta-item">
                  <Clock size={16} />
                  {CURRENT_PICK.readTime}
                </span>
              </div>

              <Link to={`/books/${CURRENT_PICK.slug}`} className="friday__cta">
                See Full Details
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Week */}
      <section className="friday__why">
        <h2 className="friday__section-title">Why This Week</h2>
        <blockquote className="friday__why-quote">
          "{CURRENT_PICK.whyThisWeek}"
        </blockquote>
        <p className="friday__why-attribution">— Shook</p>
      </section>

      {/* Marginalia Carousel */}
      <section className="friday__marginalia">
        <h2 className="friday__section-title">Marginalia</h2>
        <div className="friday__notes">
          <button
            className="friday__note-nav friday__note-nav--prev"
            onClick={() => setActiveNote(Math.max(0, activeNote - 1))}
            disabled={activeNote === 0}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="friday__note-content">
            <p className="friday__note-text">"{CURRENT_PICK.marginalia[activeNote]}"</p>
            <div className="friday__note-dots">
              {CURRENT_PICK.marginalia.map((_, i) => (
                <button
                  key={i}
                  className={`friday__note-dot ${i === activeNote ? "friday__note-dot--active" : ""}`}
                  onClick={() => setActiveNote(i)}
                />
              ))}
            </div>
          </div>

          <button
            className="friday__note-nav friday__note-nav--next"
            onClick={() => setActiveNote(Math.min(CURRENT_PICK.marginalia.length - 1, activeNote + 1))}
            disabled={activeNote === CURRENT_PICK.marginalia.length - 1}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Content & Perfect For */}
      <section className="friday__details">
        <div className="friday__warnings">
          <h3 className="friday__detail-title">Content Notes</h3>
          <ul className="friday__warning-list">
            {CURRENT_PICK.contentWarnings.map((warning) => (
              <li key={warning} className="friday__warning-item">{warning}</li>
            ))}
          </ul>
        </div>

        <div className="friday__perfect-for">
          <h3 className="friday__detail-title">Perfect For</h3>
          <ul className="friday__perfect-list">
            {CURRENT_PICK.perfectFor.map((item) => (
              <li key={item} className="friday__perfect-item">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Past Picks */}
      <section className="friday__archive">
        <h2 className="friday__section-title">Past Picks</h2>
        <div className="friday__past-grid">
          {PAST_PICKS.map((pick) => (
            <div key={pick.title} className="friday__past-pick">
              <img src={pick.coverUrl} alt={pick.title} className="friday__past-cover" />
              <div className="friday__past-info">
                <h4 className="friday__past-title">{pick.title}</h4>
                <p className="friday__past-author">{pick.author}</p>
                <p className="friday__past-date">{pick.date}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/collections/friday-picks" className="friday__archive-link">
          View All Friday Picks
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Subscribe CTA */}
      <section className="friday__subscribe">
        <h2 className="friday__subscribe-title">Never Miss a Pick</h2>
        <p className="friday__subscribe-text">
          Get the Friday Pick delivered to your inbox every week.
        </p>
        <a href="https://bookshook.com/#/portal/signup" className="friday__subscribe-btn">
          Subscribe Free
        </a>
      </section>
    </div>
  );
}
