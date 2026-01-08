import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminSubmissions, getAdminProposals } from "../../lib/api";

export function AdminDashboard() {
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [pendingProposals, setPendingProposals] = useState(0);
  const [eligibleProposals, setEligibleProposals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminSubmissions({ status: "pending" }),
      getAdminProposals({ status: "pending" }),
    ])
      .then(([subs, props]) => {
        setPendingSubmissions(subs.items.length);
        setPendingProposals(props.items.length);
        setEligibleProposals(props.eligible_preview.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard__title">Dashboard</h1>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Loading stats...</p>
      ) : (
        <div className="admin-dashboard__stats">
          <Link to="/admin/submissions" className="admin-stat-card">
            <div className="admin-stat-card__value">{pendingSubmissions}</div>
            <div className="admin-stat-card__label">Pending Submissions</div>
            <div className="admin-stat-card__desc">Author tag submissions awaiting review</div>
          </Link>

          <Link to="/admin/proposals" className="admin-stat-card">
            <div className="admin-stat-card__value">{pendingProposals}</div>
            <div className="admin-stat-card__label">Pending Proposals</div>
            <div className="admin-stat-card__desc">Community tag proposals</div>
          </Link>

          <Link to="/admin/proposals" className="admin-stat-card admin-stat-card--highlight">
            <div className="admin-stat-card__value">{eligibleProposals}</div>
            <div className="admin-stat-card__label">Eligible Proposals</div>
            <div className="admin-stat-card__desc">Meeting vote threshold for approval</div>
          </Link>
        </div>
      )}

      <div className="admin-dashboard__quick-actions">
        <h2 className="admin-dashboard__subtitle">Quick Actions</h2>
        <div className="admin-dashboard__actions">
          <Link to="/admin/submissions" className="admin-action-btn">
            Review Submissions
          </Link>
          <Link to="/admin/proposals" className="admin-action-btn">
            Review Proposals
          </Link>
        </div>
      </div>
    </div>
  );
}
