"use client";

import { useState } from "react";
import { UserPlus, CheckCircle } from "lucide-react";

interface AddTechnicianFormProps {
  onSuccess?: () => void;
}

export function AddTechnicianForm({ onSuccess }: AddTechnicianFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      whatsapp: formData.get("whatsapp"),
      city_state: formData.get("city_state"),
      specialties: formData.get("specialties"),
      password: formData.get("password"),
    };

    const res = await fetch("/api/technicians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      setError(data.error ?? "Erro ao cadastrar técnico.");
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2500);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-lg">
      <h2 className="section-title mb-1">Cadastrar técnico</h2>
      <p className="text-brand-ice/45 text-sm mb-6">
        O técnico receberá acesso imediato com a senha provisória informada.
      </p>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 mb-4 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Técnico cadastrado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label" htmlFor="tech-name">
              Nome completo <span className="text-brand-cyan">*</span>
            </label>
            <input
              id="tech-name"
              name="name"
              type="text"
              required
              placeholder="João Silva"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="tech-email">
              E-mail <span className="text-brand-cyan">*</span>
            </label>
            <input
              id="tech-email"
              name="email"
              type="email"
              required
              placeholder="joao@email.com"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="tech-whatsapp">
              WhatsApp
            </label>
            <input
              id="tech-whatsapp"
              name="whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="tech-city">
              Cidade / Estado
            </label>
            <input
              id="tech-city"
              name="city_state"
              type="text"
              placeholder="São Paulo, SP"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="tech-password">
              Senha provisória <span className="text-brand-cyan">*</span>
            </label>
            <input
              id="tech-password"
              name="password"
              type="text"
              required
              minLength={6}
              placeholder="mínimo 6 caracteres"
              className="input"
            />
          </div>

          <div className="col-span-2">
            <label className="label" htmlFor="tech-specialties">
              Especialidades
            </label>
            <input
              id="tech-specialties"
              name="specialties"
              type="text"
              placeholder="Ex: Python, Node.js, Automação RPA, N8N (separadas por vírgula)"
              className="input"
            />
            <p className="text-xs text-brand-ice/35 mt-1">
              Separe por vírgula
            </p>
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
          className="btn-primary gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? "Cadastrando..." : "Cadastrar técnico"}
        </button>
      </form>
    </div>
  );
}
