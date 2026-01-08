import { useEffect, useMemo, useState } from "react";
import {
  deleteInteraction,
  getBookInteractions,
  postInteraction,
  ApiError,
  type InteractionType,
} from "../lib/api";
import { useMe } from "../auth/MeContext";

type Props = {
  bookId: string;
  compact?: boolean;
};

type LocalState = {
  heart: boolean;
  save: boolean;
  tbr: boolean;
};

export default function BookActions({ bookId, compact }: Props) {
  const { isLoading: meLoading, isAuthenticated, isPaid, requireAuth, requirePaid, refresh } = useMe();
  const [state, setState] = useState<LocalState>({ heart: false, save: false, tbr: false });
  const [busy, setBusy] = useState<InteractionType | null>(null);

  const disabled = meLoading || !!busy;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isAuthenticated || !isPaid) return;

      try {
        const data = await getBookInteractions(bookId);
        const s = data.interactions ?? {};
        if (!cancelled) {
          setState({
            heart: !!s.heart,
            save: !!s.save,
            tbr: !!s.tbr,
          });
        }
      } catch {
        // Non-fatal; buttons still work on click.
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [bookId, isAuthenticated, isPaid]);

  const actions = useMemo(
    () =>
      ([
        ["heart", state.heart, "Heart"],
        ["save", state.save, "Save"],
        ["tbr", state.tbr, "TBR"],
      ] as const),
    [state.heart, state.save, state.tbr]
  );

  async function toggle(type: InteractionType) {
    if (!isAuthenticated) return requireAuth();
    if (!isPaid) return requirePaid();

    setBusy(type);
    try {
      const currentlyOn = (state as any)[type] === true;

      if (currentlyOn) {
        await deleteInteraction({ type, bookId });
        setState((s) => ({ ...s, [type]: false }));
      } else {
        await postInteraction({ type, bookId });
        setState((s) => ({ ...s, [type]: true }));
      }
    } catch (err) {
      // If the server disagrees (401/403), re-sync and route to auth/upgrade.
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        await refresh();
        if (err.status === 401) requireAuth();
        if (err.status === 403) requirePaid();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={compact ? "bookActions compact" : "bookActions"}>
      {actions.map(([type, on, label]) => (
        <button
          key={type}
          className={on ? "actionBtn on" : "actionBtn"}
          disabled={disabled}
          onClick={() => void toggle(type)}
          title={type}
        >
          {busy === type ? "..." : label}
        </button>
      ))}
    </div>
  );
}
