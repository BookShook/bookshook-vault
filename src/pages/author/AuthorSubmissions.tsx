import { useState, useEffect } from "react";
import { getAuthorSubmissions, type AuthorSubmission, type GetAuthorSubmissionsParams } from "../../lib/api";
import { SubmissionCard } from "../../components/author/SubmissionCard";

type FilterValue = "all" | "pending" | "approved" | "rejected";

export function AuthorSubmissions() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [submissions, setSubmissions] = useState<AuthorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: GetAuthorSubmissionsParams = filter === "all" ? {} : { status: filter };

    getAuthorSubmissions(params)
      .then((res) => {
        setSubmissions(res.items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load submissions");
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const filters: { value: FilterValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "var(--vault-font-serif)", fontSize: "1.75rem", marginBottom: 24 }}>
        Your Submissions
      </h1>

      <div className="filter-tabs">
        {filters.map((f) => (
          <button
            key={f.value}
            className={`filter-tab ${filter === f.value ? "filter-tab--active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Loading submissions...</p>
      ) : error ? (
        <div style={{ padding: 16, background: "#fee", borderRadius: 8, color: "#c00" }}>
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <p style={{ opacity: 0.6 }}>
          {filter === "all"
            ? "No submissions yet. Go to your dashboard to submit tags for your books."
            : `No ${filter} submissions.`}
        </p>
      ) : (
        <div>
          {submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
