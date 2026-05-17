import { createClient as createAdminClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    FROM_EMAIL,
  };

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: technicians, error: dbError } = await admin
    .from("technicians")
    .select("name, email");

  let emailResult: unknown = null;
  if (technicians && technicians.length > 0) {
    const first = technicians[0];
    emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: first.email,
      subject: "Teste GetMaker",
      html: "<p>Teste de e-mail do GetMaker.</p>",
    });
  }

  return NextResponse.json({
    checks,
    techniciansFound: technicians?.length ?? 0,
    dbError: dbError?.message ?? null,
    emailResult,
  });
}
