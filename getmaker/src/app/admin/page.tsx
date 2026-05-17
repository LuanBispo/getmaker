import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/AdminDashboard";
import type { Project, Technician } from "@/types";

export default async function AdminPage() {
  const supabase = await createClient();

  // Fetch projects
  const { data: projectsRaw } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch interests with technician info
  const { data: allInterests } = await supabase
    .from("project_interests")
    .select("project_id, technician_id, technicians(id, name, whatsapp)");

  const projects: Project[] = (projectsRaw ?? []).map((p) => {
    const projectInterests = (allInterests ?? []).filter(
      (i) => i.project_id === p.id
    );
    return {
      ...p,
      interests_count: projectInterests.length,
      interested_technicians: projectInterests.map((i) => ({
        id: (i.technicians as { id: string; name: string; whatsapp: string | null })?.id ?? "",
        name: (i.technicians as { id: string; name: string; whatsapp: string | null })?.name ?? "",
        whatsapp: (i.technicians as { id: string; name: string; whatsapp: string | null })?.whatsapp ?? null,
      })),
    };
  });

  // Fetch technicians with interest counts
  const { data: techniciansRaw } = await supabase
    .from("technicians")
    .select("*")
    .order("created_at", { ascending: false });

  const technicians: Technician[] = (techniciansRaw ?? []).map((t) => ({
    ...t,
    interests_count: (allInterests ?? []).filter(
      (i) => i.technician_id === t.id
    ).length,
  }));

  return <AdminDashboard projects={projects} technicians={technicians} />;
}
