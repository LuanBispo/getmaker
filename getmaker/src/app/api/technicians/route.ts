import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify requester is admin
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  // Use service role to create the user
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const body = await request.json();
  const { name, email, whatsapp, city_state, specialties, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  // Create auth user
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Erro ao criar usuário." },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // Create profile
  const { error: profileError } = await admin.from("profiles").insert({
    user_id: userId,
    role: "technician",
    name,
    email,
    whatsapp: whatsapp || null,
    city_state: city_state || null,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Create technician record
  const specialtiesArray = specialties
    ? (specialties as string)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const { error: techError } = await admin.from("technicians").insert({
    user_id: userId,
    name,
    email,
    whatsapp: whatsapp || null,
    city_state: city_state || null,
    specialties: specialtiesArray,
  });

  if (techError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: techError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
