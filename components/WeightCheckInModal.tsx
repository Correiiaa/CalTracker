"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, X, Check, Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface WeightCheckInModalProps {
  currentWeight: number;
  lastCheckInWeight?: number | null;
}

export function WeightCheckInModal({ currentWeight, lastCheckInWeight }: WeightCheckInModalProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [weight, setWeight] = useState(currentWeight.toString());
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  const diff = lastCheckInWeight
    ? parseFloat(weight) - lastCheckInWeight
    : null;

  const handleDismiss = () => {
    // Store dismiss timestamp in localStorage so we don't show again until next week
    localStorage.setItem("weightCheckInDismissed", new Date().toISOString());
    setDismissed(true);
  };

  const handleSubmit = async () => {
    const num = parseFloat(weight);
    if (isNaN(num) || num <= 0) {
      setError("Insira um peso válido.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/weight-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: num }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar.");

      setSuccess(true);
      setTimeout(() => {
        setDismissed(true);
        router.refresh();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Fechar */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Ignorar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Ícone + Título */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Scale className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Check-in Semanal de Peso</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Actualize o seu peso para recalcular as suas metas calóricas.
            </p>
          </div>
        </div>

        {/* Diferença em relação à semana passada */}
        {lastCheckInWeight && diff !== null && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
            diff < 0
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : diff > 0
              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
              : "bg-zinc-800/50 border-zinc-700 text-zinc-400"
          }`}>
            {diff < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : diff > 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            {diff === 0
              ? "Sem alteração desde a semana passada"
              : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg desde a semana passada (${lastCheckInWeight} kg)`}
          </div>
        )}

        {/* Input de Peso */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Peso Actual (kg)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white text-xl font-bold text-center focus:outline-none transition-colors"
            />
            <span className="text-zinc-500 font-bold text-sm">kg</span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        )}

        {/* Acções */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-all"
          >
            Ignorar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || success}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              <>
                <Check className="h-4 w-4" />
                Guardado!
              </>
            ) : (
              "Actualizar Peso"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
