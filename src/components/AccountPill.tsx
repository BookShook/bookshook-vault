import { useMe } from "../auth/MeContext";
import { openGhostPortal } from "../lib/ghostPortal";

export default function AccountPill() {
  const { me, isLoading, isAuthenticated, isPaid } = useMe();

  if (isLoading) return <div className="pill">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <button className="pill pillButton" onClick={() => openGhostPortal("signin")}>
        Sign in
      </button>
    );
  }

  const label = isPaid ? "Premium" : "Free";
  const name = me && me.isAuthenticated ? (me.name || me.email) : "Account";

  return (
    <button className="pill pillButton" onClick={() => openGhostPortal("account")} title="Open account">
      {name} - {label}
    </button>
  );
}
