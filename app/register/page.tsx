"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Estados do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("masculino");
  
  // Biométricos
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("manter");

  // Estados de submissão
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações básicas cliente
    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);
    const numAge = parseInt(age);

    if (isNaN(numWeight) || numWeight <= 0 || isNaN(numHeight) || numHeight <= 0 || isNaN(numAge) || numAge <= 0) {
      setError("Por favor, insira valores biométricos válidos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          gender,
          weight: numWeight,
          height: numHeight,
          age: numAge,
          goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao criar conta.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl space-y-8 animate-fade-in relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 font-black text-3xl tracking-tight text-emerald-400 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-orange-500 shadow-lg shadow-emerald-500/20">
              <Flame className="h-6 w-6 text-zinc-950 fill-zinc-950" />
            </div>
            <span>Cal<span className="text-orange-500">Tracker</span></span>
          </Link>
          <p className="text-zinc-500 text-sm">
            Crie a sua conta e receba um plano de calorias personalizado com IA em segundos.
          </p>
        </div>

        {/* Card Duplo */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white text-center">Registar Nova Conta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Secção 1: Credenciais */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Dados de Acesso
                </h3>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Seu Nome"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="nome@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Palavra-passe (mín. 6 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Género
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Secção 2: Biométricos */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Dados Biométricos
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Ex: 75.5"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Ex: 175"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Idade (Anos)
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Ex: 28"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Objetivo Principal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="perder">Perder Peso (Défice)</option>
                    <option value="manter">Manter Peso (Equilíbrio)</option>
                    <option value="ganhar">Ganhar Peso (Superávit)</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <>
                  Registar e Calcular Calorias
                  <UserPlus className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link Login */}
        <p className="text-center text-sm text-zinc-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
            Inicie sessão aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
