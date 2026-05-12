"use server";

import { createClient } from "@/lib/supabase/server";
import type { Urgency } from "@/types";

interface SubmitProjectResult {
  error?: string;
  success?: boolean;
}

export async function submitProject(
  formData: FormData
): Promise<SubmitProjectResult> {
  const client_name = (formData.get("client_name") as string)?.trim();
  const client_whatsapp = (formData.get("client_whatsapp") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const city_state = (formData.get("city_state") as string)?.trim() || null;
  const budget_range = (formData.get("budget_range") as string)?.trim() || null;
  const urgency = (formData.get("urgency") as Urgency) || null;

  if (!client_name || !client_whatsapp || !description) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("projects").insert({
    client_name,
    client_whatsapp,
    description,
    city_state,
    budget_range,
    urgency,
    status: "new",
  });

  if (error) {
    console.error("submitProject error:", error);
    return { error: "Erro ao salvar o projeto. Tente novamente." };
  }

  return { success: true };
}
