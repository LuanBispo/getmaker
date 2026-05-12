import { cn } from "@/lib/utils";
import type { ProjectStatus, Urgency } from "@/types";
import { STATUS_LABELS, URGENCY_LABELS } from "@/types";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  new: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  analyzing: "bg-blue-500/15 text-blue-400 border-blue-400/30",
  sent_to_technicians: "bg-purple-500/15 text-purple-400 border-purple-400/30",
  negotiating: "bg-amber-500/15 text-amber-400 border-amber-400/30",
  closed: "bg-emerald-500/15 text-emerald-400 border-emerald-400/30",
  cancelled: "bg-zinc-500/15 text-zinc-400 border-zinc-400/30",
};

const URGENCY_STYLES: Record<Urgency, string> = {
  high: "bg-red-500/15 text-red-400 border-red-400/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-400/30",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-400/30",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency | null }) {
  if (!urgency) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        URGENCY_STYLES[urgency]
      )}
    >
      {URGENCY_LABELS[urgency]}
    </span>
  );
}
