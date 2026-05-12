"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";
import { AddTechnicianForm } from "./AddTechnicianForm";
import { formatDate, formatWhatsAppLink } from "@/lib/utils";
import type { Project, Technician, ProjectStatus } from "@/types";
import { STATUS_LABELS } from "@/types";
import {
  Zap,
  LogOut,
  LayoutGrid,
  Users,
  UserPlus,
  MessageCircle,
  ChevronDown,
  MapPin,
  DollarSign,
  Trash2,
  Phone,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "projects" | "technicians" | "add-technician";

interface AdminDashboardProps {
  projects: Project[];
  technicians: Technician[];
}

export function AdminDashboard({
  projects: initialProjects,
  technicians: initialTechnicians,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState(initialProjects);
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }

  async function handleDeleteTechnician(technicianId: string) {
    if (!confirm("Tem certeza que deseja excluir este técnico?")) return;
    const res = await fetch(`/api/technicians/${technicianId}`, { method: "DELETE" });
    if (res.ok) setTechnicians((prev) => prev.filter((t) => t.id !== technicianId));
  }

  async function handleStatusChange(projectId: string, status: ProjectStatus) {
    setUpdatingStatus(projectId);
    const res = await fetch(`/api/projects/${projectId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status } : p))
      );
    }
    setUpdatingStatus(null);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "projects",
      label: "Projetos",
      icon: <LayoutGrid className="w-4 h-4" />,
      count: projects.length,
    },
    {
      id: "technicians",
      label: "Técnicos",
      icon: <Users className="w-4 h-4" />,
      count: technicians.length,
    },
    {
      id: "add-technician",
      label: "Cadastrar técnico",
      icon: <UserPlus className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Navbar */}
      <header className="border-b border-brand-border/60 bg-brand-muted/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-cyan flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-brand-dark fill-brand-dark" />
            </div>
            <span className="font-bold text-brand-ice tracking-tight">
              Get<span className="text-brand-cyan">Maker</span>
            </span>
            <span className="ml-2 text-xs bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 rounded-full px-2 py-0.5 font-medium">
              Admin
            </span>
          </div>

          <button onClick={handleLogout} className="btn-ghost text-xs py-1.5 px-3">
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-brand-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-brand-cyan text-brand-cyan"
                  : "border-transparent text-brand-ice/50 hover:text-brand-ice/80"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs rounded-full px-1.5 py-0.5 font-medium",
                    activeTab === tab.id
                      ? "bg-brand-cyan/20 text-brand-cyan"
                      : "bg-brand-border text-brand-ice/50"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Projects */}
        {activeTab === "projects" && (
          <div className="space-y-3">
            <h2 className="section-title mb-4">Todos os projetos</h2>
            {projects.length === 0 ? (
              <p className="text-brand-ice/40 text-center py-16">
                Nenhum projeto cadastrado ainda.
              </p>
            ) : (
              projects.map((project) => (
                <ProjectAdminRow
                  key={project.id}
                  project={project}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteProject}
                  isUpdating={updatingStatus === project.id}
                />
              ))
            )}
          </div>
        )}

        {/* Tab: Technicians */}
        {activeTab === "technicians" && (
          <div>
            <h2 className="section-title mb-4">Técnicos cadastrados</h2>
            {technicians.length === 0 ? (
              <p className="text-brand-ice/40 text-center py-16">
                Nenhum técnico cadastrado ainda.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {technicians.map((tech) => (
                  <TechnicianAdminCard key={tech.id} technician={tech} onDelete={handleDeleteTechnician} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Add Technician */}
        {activeTab === "add-technician" && (
          <AddTechnicianForm onSuccess={() => router.refresh()} />
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ProjectAdminRow({
  project,
  onStatusChange,
  onDelete,
  isUpdating,
}: {
  project: Project;
  onStatusChange: (id: string, status: ProjectStatus) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const whatsappLink = formatWhatsAppLink(project.client_whatsapp);

  return (
    <div className="card border-brand-border/60 space-y-0">
      {/* Row header */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="font-semibold text-brand-ice">
              {project.client_name}
            </span>
            <StatusBadge status={project.status} />
            {project.urgency && <UrgencyBadge urgency={project.urgency} />}
          </div>

          <div className="flex items-center gap-4 text-xs text-brand-ice/40 flex-wrap">
            {project.city_state && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {project.city_state}
              </span>
            )}
            {project.budget_range && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {project.budget_range}
              </span>
            )}
            <span>{formatDate(project.created_at)}</span>
            <span className="text-brand-cyan/70">
              {project.interests_count ?? 0} interesse(s)
            </span>
          </div>

          <p className="text-brand-ice/55 text-sm mt-2 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={project.status}
              onChange={(e) =>
                onStatusChange(project.id, e.target.value as ProjectStatus)
              }
              disabled={isUpdating}
              className="input text-xs py-1.5 pr-8 appearance-none cursor-pointer"
            >
              {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-ice/40 pointer-events-none" />
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "btn-ghost text-xs py-1.5 px-3",
              expanded && "bg-brand-border/50"
            )}
          >
            {expanded ? "Fechar" : "Ver mais"}
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="btn-ghost text-xs py-1.5 px-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            title="Excluir projeto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-brand-border/50 space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-brand-cyan shrink-0" />
            <span className="text-sm text-brand-ice/70">WhatsApp:</span>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-ice hover:text-brand-cyan transition flex items-center gap-1"
            >
              {project.client_whatsapp}
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>
          <div>
            <p className="text-xs text-brand-ice/40 uppercase tracking-wider mb-1">
              Descrição completa
            </p>
            <p className="text-sm text-brand-ice/75 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TechnicianAdminCard({ technician, onDelete }: { technician: Technician; onDelete: (id: string) => void }) {
  const whatsappLink = technician.whatsapp
    ? formatWhatsAppLink(technician.whatsapp)
    : null;

  return (
    <div className="card border-brand-border/60 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-brand-ice">{technician.name}</h3>
          <p className="text-brand-ice/45 text-xs mt-0.5">{technician.email}</p>
        </div>
        {(technician.interests_count ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-xs text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-2 py-0.5">
            <Star className="w-3 h-3" />
            {technician.interests_count}
          </span>
        )}
      </div>

      {technician.city_state && (
        <p className="text-brand-ice/45 text-xs flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {technician.city_state}
        </p>
      )}

      {technician.specialties && technician.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {technician.specialties.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-xs bg-brand-dark border border-brand-border rounded-full px-2 py-0.5 text-brand-ice/60"
            >
              {s}
            </span>
          ))}
          {technician.specialties.length > 4 && (
            <span className="text-xs text-brand-ice/35 px-1">
              +{technician.specialties.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 text-xs text-brand-ice/40">
        <span>Desde {formatDate(technician.created_at)}</span>
        <div className="flex items-center gap-2">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400/70 hover:text-emerald-400 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          )}
          <button
            onClick={() => onDelete(technician.id)}
            className="flex items-center gap-1 text-red-400/60 hover:text-red-400 transition"
            title="Excluir técnico"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
