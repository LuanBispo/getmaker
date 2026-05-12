"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetailModal } from "./ProjectDetailModal";
import type { Project, Technician, ProjectStatus, Urgency } from "@/types";
import { STATUS_LABELS, URGENCY_LABELS } from "@/types";
import { Zap, LogOut, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicianDashboardProps {
  projects: Project[];
  technician: Technician | null;
}

export function TechnicianDashboard({
  projects: initialProjects,
  technician,
}: TechnicianDashboardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "">("");
  const [filterUrgency, setFilterUrgency] = useState<Urgency | "">("");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleInterestRegistered(projectId: string) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              user_has_interest: true,
              interests_count: (p.interests_count ?? 0) + 1,
            }
          : p
      )
    );
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) =>
        prev
          ? {
              ...prev,
              user_has_interest: true,
              interests_count: (prev.interests_count ?? 0) + 1,
            }
          : null
      );
    }
  }

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.client_name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.city_state?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesUrgency = !filterUrgency || p.urgency === filterUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const newCount = projects.filter((p) => p.status === "new").length;

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Navbar */}
      <header className="border-b border-brand-border/60 bg-brand-muted/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-cyan flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-brand-dark fill-brand-dark" />
            </div>
            <span className="font-bold text-brand-ice tracking-tight">
              Get<span className="text-brand-cyan">Maker</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {technician && (
              <span className="text-sm text-brand-ice/50 hidden sm:block">
                {technician.name}
              </span>
            )}
            <button onClick={handleLogout} className="btn-ghost text-xs py-1.5 px-3">
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-ice">
              Projetos disponíveis
            </h1>
            <p className="text-brand-ice/45 text-sm mt-1">
              {projects.length} projeto{projects.length !== 1 ? "s" : ""} no total
              {newCount > 0 && (
                <span className="ml-2 text-brand-cyan font-medium">
                  · {newCount} novo{newCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ice/30" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-ice/40 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | "")}
              className="input w-auto"
            >
              <option value="">Todos os status</option>
              {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as Urgency | "")}
              className="input w-auto"
            >
              <option value="">Toda urgência</option>
              {(Object.keys(URGENCY_LABELS) as Urgency[]).map((u) => (
                <option key={u} value={u}>
                  {URGENCY_LABELS[u]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-muted border border-brand-border flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-brand-ice/30" />
            </div>
            <p className="text-brand-ice/50 font-medium">Nenhum projeto encontrado</p>
            <p className="text-brand-ice/30 text-sm mt-1">
              Tente ajustar os filtros ou aguarde novos projetos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={setSelectedProject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onInterestRegistered={handleInterestRegistered}
        />
      )}
    </div>
  );
}
