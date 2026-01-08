import { useState, useEffect, useCallback } from "react";
import { getAdminProposals, decideProposal, type AdminProposal } from "../../lib/api";
import { useAdmin } from "../../auth/AdminContext";
import { StatusBadge } from "../../components/author/StatusBadge";

type FilterStatus = "pending" | "approved" | "rejected" | "all";

export function AdminProposals() {
  const { csrfToken } = useAdmin();
  const [proposals, setProposals] = useState<AdminProposal[]>([]);
  const [eligibleIds, setEligibleIds] = useState<Set<string>>(new Set());
  const [threshold, setThreshold] = useState({ minVotes: 20, minRatio: 0.75 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");

  const loadProposals = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? {} : { status: filter as "pending" | "approved" | "rejected" };
      const res = await getAdminProposals(params);
      setProposals(res.items);
      setEligibleIds(new Set(res.eligible_preview.map((p) => p.id)));
      setThreshold(res.threshold);
    } catch {
      setProposals([]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="admin-proposals">
      <h1 className="admin-proposals__title">Community Proposals</h1>
      <p className="admin-proposals__threshold">
        Approval threshold: {threshold.minVotes} votes, {Math.round(threshold.minRatio * 100)}% upvote ratio
      </p>

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
        <p style={{ opacity: 0.6, padding: 24 }}>Loading proposals...</p>
      ) : proposals.length === 0 ? (
        <div className="admin-empty">
          <p>No {filter === "all" ? "" : filter} proposals found.</p>
        </div>
      ) : (
        <div className="admin-proposals__list">
          {proposals.map((prop) => (
            <ProposalCard
              key={prop.id}
              proposal={prop}
              isEligible={eligibleIds.has(prop.id)}
              csrfToken={csrfToken}
              onDecided={loadProposals}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type ProposalCardProps = {
  proposal: AdminProposal;
  isEligible: boolean;
  csrfToken: string | null;
  onDecided: () => void;
};

function ProposalCard({ proposal, isEligible, csrfToken, onDecided }: ProposalCardProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecide = async (action: "approve" | "reject") => {
    if (!csrfToken) return;
    setDeciding(true);
    setError(null);

    try {
      await decideProposal(proposal.id, action, csrfToken, action === "reject" ? rejectionReason : undefined);
      onDecided();
    } catch (err: any) {
      setError(err.message || "Decision failed");
      setDeciding(false);
    }
  };

  const isPending = proposal.status === "pending";
  const upvotePercent = proposal.upvote_ratio ? Math.round(proposal.upvote_ratio * 100) : 0;

  return (
    <div className={`admin-proposal-card ${isEligible ? "admin-proposal-card--eligible" : ""}`}>
      <div className="admin-proposal-card__header">
        <div className="admin-proposal-card__type">
          {proposal.proposal_type === "create_new" ? "New Tag" : "Assign Tag"}
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      {proposal.book_title && (
        <div className="admin-proposal-card__book">
          <strong>Book:</strong> {proposal.book_title}
        </div>
      )}

      {proposal.proposal_type === "create_new" ? (
        <div className="admin-proposal-card__new-tag">
          <span className="admin-proposal-card__tag-name">{proposal.proposed_name}</span>
          <span className="admin-proposal-card__tag-category">{proposal.proposed_category_key}</span>
        </div>
      ) : (
        <div className="admin-proposal-card__existing-tag">
          <span className="admin-proposal-card__tag-name">{proposal.existing_tag_name}</span>
          <span className="admin-proposal-card__tag-category">{proposal.existing_tag_category}</span>
        </div>
      )}

      <div className="admin-proposal-card__rationale">
        <strong>Rationale:</strong> {proposal.rationale}
      </div>

      <div className="admin-proposal-card__votes">
        <span className="admin-proposal-card__vote admin-proposal-card__vote--up">
          +{proposal.upvotes}
        </span>
        <span className="admin-proposal-card__vote admin-proposal-card__vote--down">
          -{proposal.downvotes}
        </span>
        <span className="admin-proposal-card__ratio">
          ({upvotePercent}% upvote)
        </span>
        {isEligible && <span className="admin-proposal-card__eligible-badge">Eligible</span>}
      </div>

      <div className="admin-proposal-card__date">
        Created: {new Date(proposal.created_at).toLocaleDateString()}
      </div>

      {isPending && (
        <div className="admin-proposal-card__actions">
          <textarea
            className="admin-proposal-card__notes"
            placeholder="Rejection reason (required if rejecting)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={deciding}
          />

          {error && <div className="admin-proposal-card__error">{error}</div>}

          <div className="admin-proposal-card__buttons">
            <button
              className="admin-proposal-card__btn admin-proposal-card__btn--approve"
              onClick={() => handleDecide("approve")}
              disabled={deciding}
            >
              {deciding ? "..." : "Approve"}
            </button>
            <button
              className="admin-proposal-card__btn admin-proposal-card__btn--reject"
              onClick={() => handleDecide("reject")}
              disabled={deciding || !rejectionReason.trim()}
            >
              {deciding ? "..." : "Reject"}
            </button>
          </div>
        </div>
      )}

      {!isPending && proposal.rejection_reason && (
        <div className="admin-proposal-card__rejection">
          <strong>Rejection Reason:</strong> {proposal.rejection_reason}
        </div>
      )}
    </div>
  );
}
