"use client";

export type Toast = {
  id: string;
  message: string;
  tone: "info" | "danger";
};

type ToastsProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

/**
 * Brief confirmations for actions that would otherwise be silent — mostly
 * deletes, where the task simply vanishes from the list.
 */
export default function Toasts({ toasts, onDismiss }: ToastsProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast ${toast.tone}`}
          onClick={() => onDismiss(toast.id)}
          aria-label={`Dismiss: ${toast.message}`}>
          {toast.message}
        </button>
      ))}
    </div>
  );
}
