"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, buildNewProjectEmail } from "@/lib/email";
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

  // Envia e-mails para todos os técnicos em background (não bloqueia resposta)
  notifyTechnicians({
    client_name,
    description,
    city_state,
    budget_range,
    urgency,
  }).catch((err) => console.error("notifyTechnicians error:", err));

  return { success: true };
}

async function notifyTechnicians(project: {
  client_name: string;
  description: string;
  city_state: string | null;
  budget_range: string | null;
  urgency: string | null;
}) {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: technicians } = await admin
    .from("technicians")
    .select("name, email");

  if (!technicians || technicians.length === 0) return;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://getmaker.vercel.app";

  // Envia para cada técnico individualmente
  const emails = technicians.map((tech: { name: string; email: string }) =>
    resend.emails.send({
      from: FROM_EMAIL,
      to: tech.email,
      subject: `⚡ Novo projeto no GetMaker: ${project.client_name}`,
      html: buildNewProjectEmail({
        technicianName: tech.name,
        technicianEmail: tech.email,
        clientName: project.client_name,
        description: project.description,
        cityState: project.city_state,
        budgetRange: project.budget_range,
        urgency: project.urgency,
        siteUrl,
      }),
    })
  );

  await Promise.allSettled(emails);
}
