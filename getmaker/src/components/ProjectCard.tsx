import { MapPin, DollarSign, Users, Calendar } from "lucide-react";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";
import { formatDate, truncate } from "@/lib/utils";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const isNew = project.status === "new";

  return (
    <button
      onClick={() => onClick(project)}
      className={cn(
        "card w-full text-left transition-all hover:border-brand-cyan/50 hover:shadow-lg hover:shadow-brand-cyan/5 active:scale-[0.99] group",
        isNew && "border-brand-cyan/30"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-brand-ice truncate group-hover:text-brand-cyan transition-colors">
            {project.client_name}
          </h3>
          {project.city_state && (
            <p className="text-brand-ice/45 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {project.city_state}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={project.status} />
          {project.urgency && <UrgencyBadge urgency={project.urgency} />}
        </div>
      </div>

      {/* Description */}
      <p className="text-brand-ice/60 text-sm leading-relaxed mb-4">
        {truncate(project.description, 120)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-brand-border/50">
        <div className="flex items-center gap-3 text-xs text-brand-ice/40">
          {project.budget_range && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {project.budget_range}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(project.created_at)}
          </span>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            (project.interests_count ?? 0) > 0
              ? "text-brand-cyan"
              : "text-brand-ice/30"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>
            {project.interests_count ?? 0}{" "}
            {(project.interests_count ?? 0) === 1 ? "interesse" : "interesses"}
          </span>
        </div>
      </div>

      {project.user_has_interest && (
        <div className="mt-3 text-xs text-brand-cyan/70 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg px-3 py-1.5 text-center">
          Você já demonstrou interesse
        </div>
      )}
    </button>
  );
}
