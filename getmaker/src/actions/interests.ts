"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface InterestResult {
  error?: string;
  success?: boolean;
  alreadyExists?: boolean;
}

export async function registerInterest(
  projectId: string
): Promise<InterestResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado." };

  const { data: technician } = await supabase
    .from("technicians")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!technician) return { error: "Perfil de técnico não encontrado." };

  const { data: existing } = await supabase
    .from("project_interests")
    .select("id")
    .eq("project_id", projectId)
    .eq("technician_id", technician.id)
    .single();

  if (existing) return { alreadyExists: true };

  const { error } = await supabase.from("project_interests").insert({
    project_id: projectId,
    technician_id: technician.id,
  });

  if (error) return { error: "Erro ao registrar interesse." };

  revalidatePath("/tecnico");
  return { success: true };
}
