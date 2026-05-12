import { createClient } from "@/lib/supabase/server";
import { TechnicianDashboard } from "@/components/TechnicianDashboard";
import type { Project, Technician } from "@/types";

export default async function TechnicoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch technician record
  const { data: technician } = await supabase
    .from("technicians")
    .select("*")
    .eq("user_id", user!.id)
    .single<Technician>();

  // Fetch all projects
  const { data: projectsRaw } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all interests for counts and current user
  const { data: allInterests } = await supabase
    .from("project_interests")
    .select("project_id, technician_id");

  const projects: Project[] = (projectsRaw ?? []).map((p) => {
    const projectInterests = (allInterests ?? []).filter(
      (i) => i.project_id === p.id
    );
    return {
      ...p,
      interests_count: projectInterests.length,
      user_has_interest: technician
        ? projectInterests.some((i) => i.technician_id === technician.id)
        : false,
    };
  });

  return (
    <TechnicianDashboard
      projects={projects}
      technician={technician ?? null}
    />
  );
}
