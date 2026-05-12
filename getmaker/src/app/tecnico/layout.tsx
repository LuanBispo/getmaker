import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "technician") redirect("/login");

  return <>{children}</>;
}
