import { createClient as createAdminClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  // 1. Verifica variáveis de ambiente
  const checks = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    FROM_EMAIL,
  };

  // 2. Busca técnicos
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: technicians, error: dbError } = await admin
    .from("technicians")
    .select("name, email");

  // 3. Tenta enviar e-mail para o primeiro técnico
  let emailResult = null;
  if (technicians && technicians.length > 0) {
    const first = technicians[0];
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: first.email,
      subject: "Teste GetMaker",
      html: "<p>Teste de e-mail do GetMaker.</p>",
    });
    emailResult = result;
  }

  return NextResponse.json({
    checks,
    techniciansFound: technicians?.length ?? 0,
    dbError: dbError?.message ?? null,
    emailResult,
  });
}
