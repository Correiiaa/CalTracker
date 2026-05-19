"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Activity, Flame, Scale, Check, Loader2 } from "lucide-react";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    weight: number;
    height: number;
    age: number;
    gender: string;
    goal: string;
    dailyCalories: number;
    autoCalories: boolean;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  // Estados dos inputs
  const [name, setName] = useState(user.name);
  const [weight, setWeight] = useState(user.weight.toString());
  const [height, setHeight] = useState(user.height.toString());
  const [age, setAge] = useState(user.age.toString());
  const [gender, setGender] = useState(user.gender);
  const [goal, setGoal] = useState(user.goal);
  const [dailyCalories, setDailyCalories] = useState(user.dailyCalories.toString());
  
  // Opção de cálculo automático
  const [isAutoCalorie, setIsAutoCalorie] = useState(user.autoCalories);

  // Estados de submissão
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fórmula Harris-Benedict no cliente
  const calculateClientCalories = (w: number, h: number, a: number, g: string, gl: string) => {
    let bmr = 0;
    if (g.toLowerCase() === "masculino") {
      bmr = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      bmr = 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
    }
    const maintenance = Math.round(bmr * 1.375);
    if (gl === "perder") return Math.round(maintenance - 500);
    if (gl === "ganhar") return Math.round(maintenance + 350);
    return maintenance;
  };

  const bmrValue = Math.round(
    gender === "masculino"
      ? 88.362 + 13.397 * (parseFloat(weight) || 0) + 4.799 * (parseFloat(height) || 0) - 5.677 * (parseInt(age) || 0)
      : 447.593 + 9.247 * (parseFloat(weight) || 0) + 3.098 * (parseFloat(height) || 0) - 4.33 * (parseInt(age) || 0)
  );

  const maintenanceValue = Math.round(bmrValue * 1.375);

  // Recalcular calorias se biométricos mudarem e o auto estiver ligado
  useEffect(() => {
    if (!isAutoCalorie) return;
    const numWeight = parseFloat(weight) || 0;
    const numHeight = parseFloat(height) || 0;
    const numAge = parseInt(age) || 0;

    if (numWeight > 0 && numHeight > 0 && numAge > 0) {
      const calculated = calculateClientCalories(numWeight, numHeight, numAge, gender, goal);
      setDailyCalories(calculated.toString());
    }
  }, [weight, height, age, gender, goal, isAutoCalorie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age),
          gender,
          goal,
          dailyCalories: parseInt(dailyCalories),
          autoCalories: isAutoCalorie,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao guardar alterações.");
      }

      setSuccess(true);
      router.refresh();

      // Temporizador para tirar a mensagem de sucesso
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao atualizar o perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Formulário de Perfil (Colunas 2/3) */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 shadow-2xl">
          
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            Dados Pessoais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Nome
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Género
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Altura (cm)
              </label>
              <input
                type="number"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Idade
              </label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Objetivo de Peso
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="perder">Perder peso (-500 kcal)</option>
                <option value="manter">Manter peso (Equilíbrio)</option>
                <option value="ganhar">Ganhar peso (+350 kcal)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Secção Calorias Alvo */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Meta de Calorias
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoCalorie}
                onChange={(e) => setIsAutoCalorie(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-zinc-800 text-emerald-500 bg-zinc-950 focus:ring-0"
              />
              <span className="text-sm font-semibold text-zinc-300">
                Calcular recomendado automaticamente
              </span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Objetivo Diário (kcal)
              </label>
              <input
                type="number"
                disabled={isAutoCalorie}
                value={dailyCalories}
                onChange={(e) => setDailyCalories(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 disabled:border-zinc-900 disabled:text-zinc-500 rounded-xl px-4 py-3 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Notificações e Ações */}
          <div className="pt-2">
            {error && (
              <p className="text-sm text-red-400 font-semibold mb-4">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
            >
              {submitting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : success ? (
                <Check className="h-4.5 w-4.5" />
              ) : null}
              {success ? "Alterações Guardadas!" : "Guardar Alterações"}
            </button>
          </div>
        </div>
      </form>

      {/* Lado Direito: Resumo Metabólico (Coluna 1) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Análise Metabólica
          </h2>

          <p className="text-xs text-zinc-400">
            Estimativa das tuas taxas metabólicas com base na equação de Harris-Benedict (com atividade física leve/moderada).
          </p>

          <div className="space-y-4">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Taxa Metabólica Basal (BMR)</span>
              <strong className="text-xl font-extrabold text-white mt-1">{bmrValue} kcal</strong>
              <span className="text-[10px] text-zinc-500 mt-1">Calorias gastas em repouso absoluto.</span>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Gasto Diário de Manutenção</span>
              <strong className="text-xl font-extrabold text-zinc-300 mt-1">{maintenanceValue} kcal</strong>
              <span className="text-[10px] text-zinc-500 mt-1">Calorias para manter o teu peso atual.</span>
            </div>
            
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Objetivo ({goal})</span>
              <strong className="text-xl font-extrabold text-emerald-400 mt-1">{dailyCalories} kcal</strong>
              <span className="text-[10px] text-zinc-500 mt-1">
                {goal === "perder" 
                  ? "Défice de -500 kcal para queimar gordura." 
                  : goal === "ganhar" 
                    ? "Superávit de +350 kcal para ganho muscular." 
                    : "Equilíbrio calórico para manutenção de peso."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
