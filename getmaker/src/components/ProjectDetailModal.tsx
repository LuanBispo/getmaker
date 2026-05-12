"use client";

import { useState, useTransition } from "react";
import {
  X,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  MessageCircle,
  CheckCircle,
  Phone,
} from "lucide-react";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";
import { formatDate, formatWhatsAppLink } from "@/lib/utils";
import { registerInterest } from "@/actions/interests";
import type { Project } from "@/types";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onInterestRegistered?: (projectId: string) => void;
}

export function ProjectDetailModal({
  project,
  onClose,
  onInterestRegistered,
}: ProjectDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [hasInterest, setHasInterest] = useState(
    project.user_has_interest ?? false
  );
  const [interestCount, setInterestCount] = useState(
    project.interests_count ?? 0
  );
  const [interestError, setInterestError] = useState<string | null>(null);

  function handleInterest() {
    startTransition(async () => {
      setInterestError(null);
      const result = await registerInterest(project.id);
      if (result.alreadyExists || result.success) {
        setHasInterest(true);
        if (result.success) {
          setInterestCount((c) => c + 1);
          onInterestRegistered?.(project.id);
        }
      } else if (result.error) {
        setInterestError(result.error);
      }
    });
  }

  const whatsappLink = formatWhatsAppLink(
    project.client_whatsapp,
    `Olá ${project.client_name}, vi seu projeto no GetMaker e tenho interesse em ajudar!`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-brand-muted border border-brand-border rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-brand-ice">
              {project.client_name}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={project.status} />
              {project.urgency && <UrgencyBadge urgency={project.urgency} />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-ice/40 hover:text-brand-ice transition p-1 rounded-lg hover:bg-brand-border/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {project.city_state && (
              <div className="flex items-center gap-2 text-brand-ice/60">
                <MapPin className="w-4 h-4 text-brand-cyan/70 shrink-0" />
                <span>{project.city_state}</span>
              </div>
            )}
            {project.budget_range && (
              <div className="flex items-center gap-2 text-brand-ice/60">
                <DollarSign className="w-4 h-4 text-brand-cyan/70 shrink-0" />
                <span>{project.budget_range}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-brand-ice/60">
              <Calendar className="w-4 h-4 text-brand-cyan/70 shrink-0" />
              <span>{formatDate(project.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-ice/60">
              <Users className="w-4 h-4 text-brand-cyan/70 shrink-0" />
              <span>
                {interestCount}{" "}
                {interestCount === 1 ? "técnico interessado" : "técnicos interessados"}
              </span>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-2 bg-brand-dark/50 rounded-lg px-4 py-3">
            <Phone className="w-4 h-4 text-brand-cyan shrink-0" />
            <span className="text-sm text-brand-ice/70">WhatsApp: </span>
            <span className="text-sm font-medium text-brand-ice">
              {project.client_whatsapp}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-brand-ice/50 uppercase tracking-wider mb-2">
              Descrição do projeto
            </h3>
            <p className="text-brand-ice/80 text-sm leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3 border-t border-brand-border/50 pt-4">
          {interestError && (
            <p className="text-red-400 text-xs text-center">{interestError}</p>
          )}

          {hasInterest ? (
            <div className="flex items-center justify-center gap-2 text-brand-cyan text-sm py-2.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Você já demonstrou interesse neste projeto
            </div>
          ) : (
            <button
              onClick={handleInterest}
              disabled={isPending}
              className="btn-primary w-full py-2.5"
            >
              {isPending ? "Registrando..." : "Tenho interesse"}
            </button>
          )}

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
