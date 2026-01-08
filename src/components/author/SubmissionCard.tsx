import type { AuthorSubmission } from "../../lib/api";
import { StatusBadge } from "./StatusBadge";

type SubmissionCardProps = {
  submission: AuthorSubmission;
};

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const evidence = submission.evidence_json;
  const evidenceParts: string[] = [];
  if (evidence.chapter) evidenceParts.push(`Ch. ${evidence.chapter}`);
  if (evidence.page) evidenceParts.push(`p. ${evidence.page}`);
  if (evidence.location) evidenceParts.push(evidence.location);

  return (
    <div className="submission-card">
      <div className="submission-card__main">
        <div className="submission-card__book">{submission.title || "Unknown Book"}</div>
        <div className="submission-card__tag">
          {submission.name || "Unknown Tag"}
          {submission.category && <span style={{ opacity: 0.6 }}> ({submission.category})</span>}
        </div>
        {(evidenceParts.length > 0 || evidence.notes) && (
          <div className="submission-card__evidence">
            {evidenceParts.join(" · ")}
            {evidence.notes && (evidenceParts.length > 0 ? ` — "${evidence.notes}"` : `"${evidence.notes}"`)}
          </div>
        )}
      </div>
      <div className="submission-card__meta">
        <StatusBadge status={submission.status} />
        <div className="submission-card__date">
          {new Date(submission.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
