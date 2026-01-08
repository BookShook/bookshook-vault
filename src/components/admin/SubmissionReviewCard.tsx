import { useState } from "react";
import { type AdminSubmission, decideSubmission } from "../../lib/api";
import { useAdmin } from "../../auth/AdminContext";
import { StatusBadge } from "../author/StatusBadge";

type SubmissionReviewCardProps = {
  submission: AdminSubmission;
  onDecided?: () => void;
};

export function SubmissionReviewCard({ submission, onDecided }: SubmissionReviewCardProps) {
  const { csrfToken } = useAdmin();
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evidence = submission.evidence_json;
  const evidenceParts: string[] = [];
  if (evidence.chapter) evidenceParts.push(`Chapter: ${evidence.chapter}`);
  if (evidence.page) evidenceParts.push(`Page: ${evidence.page}`);
  if (evidence.location) evidenceParts.push(`Location: ${evidence.location}`);
  if (evidence.notes) evidenceParts.push(`Notes: ${evidence.notes}`);

  const handleDecide = async (action: "approve" | "reject") => {
    if (!csrfToken) return;
    setDeciding(true);
    setError(null);

    try {
      await decideSubmission(submission.id, action, csrfToken, reviewerNotes || undefined);
      onDecided?.();
    } catch (err: any) {
      setError(err.message || "Decision failed");
      setDeciding(false);
    }
  };

  const isPending = submission.status === "pending";

  return (
    <div className="admin-review-card">
      <div className="admin-review-card__header">
        <div className="admin-review-card__meta">
          <span className="admin-review-card__book">{submission.title}</span>
          <span className="admin-review-card__author">by {submission.author_name}</span>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="admin-review-card__tag">
        <span className="admin-review-card__tag-name">{submission.tag_name}</span>
        <span className="admin-review-card__tag-category">{submission.category}</span>
      </div>

      <div className="admin-review-card__evidence">
        <div className="admin-review-card__evidence-label">Evidence</div>
        {evidenceParts.length > 0 ? (
          <ul className="admin-review-card__evidence-list">
            {evidenceParts.map((part, i) => (
              <li key={i}>{part}</li>
            ))}
          </ul>
        ) : (
          <p className="admin-review-card__no-evidence">No evidence provided</p>
        )}
      </div>

      <div className="admin-review-card__date">
        Submitted: {new Date(submission.created_at).toLocaleDateString()}
      </div>

      {isPending && (
        <div className="admin-review-card__actions">
          <textarea
            className="admin-review-card__notes"
            placeholder="Reviewer notes (optional)..."
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            disabled={deciding}
          />

          {error && <div className="admin-review-card__error">{error}</div>}

          <div className="admin-review-card__buttons">
            <button
              className="admin-review-card__btn admin-review-card__btn--approve"
              onClick={() => handleDecide("approve")}
              disabled={deciding}
            >
              {deciding ? "..." : "Approve"}
            </button>
            <button
              className="admin-review-card__btn admin-review-card__btn--reject"
              onClick={() => handleDecide("reject")}
              disabled={deciding}
            >
              {deciding ? "..." : "Reject"}
            </button>
          </div>
        </div>
      )}

      {!isPending && submission.reviewer_notes && (
        <div className="admin-review-card__reviewer-notes">
          <strong>Reviewer Notes:</strong> {submission.reviewer_notes}
        </div>
      )}
    </div>
  );
}
