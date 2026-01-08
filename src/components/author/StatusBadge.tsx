type StatusBadgeProps = {
  status: "pending" | "approved" | "rejected";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status}`}>{status}</span>;
}
