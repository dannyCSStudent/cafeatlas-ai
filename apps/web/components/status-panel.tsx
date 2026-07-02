import type { ReactNode } from "react";

type StatusPanelProps = {
  title: string;
  message?: string;
  tone?: "neutral" | "error" | "empty";
  action?: ReactNode;
};

const toneClasses = {
  neutral: "border-[var(--site-border)] bg-[var(--site-surface-card)] text-[var(--foreground)]",
  error: "border-[var(--site-error)] bg-[var(--site-error)] text-[var(--site-error-foreground)]",
  empty: "border-dashed border-[var(--site-border)] bg-[var(--site-empty)] text-[var(--site-empty-foreground)]",
} as const;

export function StatusPanel({ title, message, tone = "neutral", action }: StatusPanelProps) {
  return (
    <div className={`rounded-[1.75rem] border p-6 ${toneClasses[tone]}`}>
      <p className="font-semibold">{title}</p>
      {message ? <p className="mt-2 text-sm">{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
