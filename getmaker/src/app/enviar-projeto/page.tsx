"use client";

import { useState } from "react";
import { submitProject } from "@/actions/projects";
import { CheckCircle, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EnviarProjetoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitProject(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-[#1f2447] to-brand-dark px-4">
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 mb-6">
            <CheckCircle className="w-10 h-10 text-brand-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-brand-ice mb-3">
            Projeto enviado com sucesso!
          </h2>
          <p className="text-brand-ice/60 max-w-sm mx-auto leading-relaxed">
            Em breve um técnico poderá entrar em contato com você pelo WhatsApp
            informado.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 btn-secondary"
          >
            Enviar outro projeto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-dark via-[#1f2447] to-brand-dark">
      {/* Header */}
      <header className="flex items-center justify-center pt-10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-cyan flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-dark fill-brand-dark" />
          </div>
          <span className="text-xl font-bold text-brand-ice tracking-tight">
            Get<span className="text-brand-cyan">Maker</span>
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-ice mb-3 leading-tight">
              Conte para a gente o que você quer automatizar
            </h1>
            <p className="text-brand-ice/55 leading-relaxed">
              Descreva sua ideia ou problema. Técnicos capacitados poderão
              analisar sua demanda e entrar em contato.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="card space-y-5 border-brand-border/60 shadow-2xl"
          >
            {/* Nome */}
            <div>
              <label className="label" htmlFor="client_name">
                Nome <span className="text-brand-cyan">*</span>
              </label>
              <input
                id="client_name"
                name="client_name"
                type="text"
                required
                placeholder="Seu nome completo"
                className="input"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="label" htmlFor="client_whatsapp">
                WhatsApp <span className="text-brand-cyan">*</span>
              </label>
              <input
                id="client_whatsapp"
                name="client_whatsapp"
                type="tel"
                required
                placeholder="(11) 99999-9999"
                className="input"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="label" htmlFor="description">
                Descrição do projeto <span className="text-brand-cyan">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Descreva o que você precisa automatizar, o problema que quer resolver, ferramentas que já usa, etc."
                className="input resize-none"
              />
            </div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-brand-muted px-2 text-brand-ice/40">
                  informações opcionais
                </span>
              </div>
            </div>

            {/* Cidade/Estado */}
            <div>
              <label className="label" htmlFor="city_state">
                Cidade / Estado
              </label>
              <input
                id="city_state"
                name="city_state"
                type="text"
                placeholder="Ex: São Paulo, SP"
                className="input"
              />
            </div>

            {/* Orçamento */}
            <div>
              <label className="label" htmlFor="budget_range">
                Orçamento estimado
              </label>
              <input
                id="budget_range"
                name="budget_range"
                type="text"
                placeholder="Ex: R$ 500 – R$ 2.000"
                className="input"
              />
            </div>

            {/* Urgência */}
            <div>
              <label className="label" htmlFor="urgency">
                Urgência
              </label>
              <div className="relative">
                <select
                  id="urgency"
                  name="urgency"
                  className={cn("input appearance-none pr-10")}
                >
                  <option value="">Selecione...</option>
                  <option value="low">Baixa — sem pressa</option>
                  <option value="medium">Média — no próximo mês</option>
                  <option value="high">Alta — o quanto antes</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ice/40 pointer-events-none" />
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
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? "Enviando..." : "Enviar projeto"}
            </button>
          </form>

          <p className="text-center text-brand-ice/30 text-xs mt-6">
            Seus dados são usados apenas para contato entre você e os técnicos.
          </p>
        </div>
      </main>
    </div>
  );
}
