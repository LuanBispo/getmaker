"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Fetch role to redirect correctly
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (!profile) {
      setError("Perfil não encontrado. Entre em contato com o administrador.");
      setLoading(false);
      return;
    }

    router.push(profile.role === "admin" ? "/admin" : "/tecnico");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark via-[#1f2447] to-brand-dark px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-lg bg-brand-cyan flex items-center justify-center">
          <Zap className="w-5 h-5 text-brand-dark fill-brand-dark" />
        </div>
        <span className="text-2xl font-bold text-brand-ice tracking-tight">
          Get<span className="text-brand-cyan">Maker</span>
        </span>
      </div>

      <div className="w-full max-w-sm">
        <div className="card shadow-2xl border-brand-border/60">
          <h1 className="text-xl font-bold text-brand-ice mb-1">Entrar</h1>
          <p className="text-brand-ice/45 text-sm mb-6">
            Acesse o painel com suas credenciais
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ice/40 hover:text-brand-ice/70 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-ice/25 text-xs mt-6">
          Acesso restrito a técnicos e administradores cadastrados.
        </p>
      </div>
    </div>
  );
}
