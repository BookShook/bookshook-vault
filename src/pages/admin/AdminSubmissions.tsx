import { useState, useEffect, useCallback } from "react";
import { getAdminSubmissions, type AdminSubmission } from "../../lib/api";
import { SubmissionReviewCard } from "../../components/admin/SubmissionReviewCard";

type FilterStatus = "pending" | "approved" | "rejected" | "all";

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? {} : { status: filter as "pending" | "approved" | "rejected" };
      const res = await getAdminSubmissions(params);
      setSubmissions(res.items);
    } catch {
      setSubmissions([]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleDecided = () => {
    loadSubmissions();
  };

  const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="admin-submissions">
      <h1 className="admin-submissions__title">Author Submissions</h1>

      <div className="admin-filter-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            className={`admin-filter-tab ${filter === tab.value ? "admin-filter-tab--active" : ""}`}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ opacity: 0.6, padding: 24 }}>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <div className="admin-empty">
          <p>No {filter === "all" ? "" : filter} submissions found.</p>
        </div>
      ) : (
        <div className="admin-submissions__list">
          {submissions.map((sub) => (
            <SubmissionReviewCard key={sub.id} submission={sub} onDecided={handleDecided} />
          ))}
        </div>
      )}
    </div>
  );
}
