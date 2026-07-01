import type { ReactNode } from "react";

type StatusPanelProps = {
  title: string;
  message?: string;
  tone?: "neutral" | "error" | "empty";
  action?: ReactNode;
};

const toneClasses = {
  neutral: "border-stone-200 bg-white/80 text-stone-950",
  error: "border-amber-300 bg-amber-50 text-amber-950",
  empty: "border-dashed border-stone-300 bg-stone-50 text-stone-700",
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
