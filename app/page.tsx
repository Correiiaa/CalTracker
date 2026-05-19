import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { 
  Flame, 
  Sparkles, 
  Camera, 
  FileText, 
  Calculator, 
  ArrowRight,
  TrendingUp,
  Apple
} from "lucide-react";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-emerald-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-orange-500 shadow-md shadow-emerald-500/20">
              <Flame className="h-5 w-5 text-zinc-950 fill-zinc-950" />
            </div>
            <span>Cal<span className="text-orange-500">Tracker</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-850 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Nova Geração de Acompanhamento Nutricional
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Acompanhe o seu prato com a inteligência da <span className="text-gradient bg-gradient-to-r from-emerald-400 via-emerald-300 to-orange-400 bg-clip-text text-transparent">IA do Gemini</span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
            Basta tirar uma fotografia da sua comida ou escrever o que consumiu. O Gemini identifica os ingredientes e nós fazemos o cálculo matemático de alta precisão com a base de dados USDA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black px-8 py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Aceder ao Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black px-8 py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Começar Grátis agora
                </Link>
                <Link
                  href="/login"
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold px-8 py-4 rounded-2xl text-sm transition-all"
                >
                  Já tenho conta
                </Link>
              </>
            )}
          </div>

          <div className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-zinc-900">
            <div className="text-center lg:text-left">
              <strong className="block text-2xl font-black text-white">100%</strong>
              <span className="text-xs text-zinc-500">Automático</span>
            </div>
            <div className="text-center lg:text-left border-l border-zinc-900 pl-4">
              <strong className="block text-2xl font-black text-white">USDA</strong>
              <span className="text-xs text-zinc-500">Dados Oficiais</span>
            </div>
            <div className="text-center lg:text-left border-l border-zinc-900 pl-4">
              <strong className="block text-2xl font-black text-white">Grátis</strong>
              <span className="text-xs text-zinc-500">Sem Assinaturas</span>
            </div>
          </div>
        </div>

        {/* Mockup da Interface (Lado Direito) */}
        <div className="relative flex justify-center items-center">
          <div className="w-full max-w-[460px] aspect-[4/5] rounded-[36px] bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-orange-500/5 rounded-full blur-[60px] pointer-events-none" />

            {/* Simulação Cabeçalho do Prato */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Apple className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Prato Almoço</h4>
                  <p className="text-[10px] text-zinc-500">Analista de IA Gemini</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                98% Confiança
              </span>
            </div>

            {/* Simulação Progresso Calorias */}
            <div className="flex flex-col items-center py-6">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="42" className="stroke-zinc-800 fill-none" strokeWidth="8" />
                  <circle cx="56" cy="56" r="42" className="stroke-emerald-500 fill-none" strokeWidth="8" strokeDasharray="263" strokeDashoffset="80" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-white">492</span>
                  <span className="text-[8px] text-zinc-500 uppercase font-semibold">kcal</span>
                </div>
              </div>
            </div>

            {/* Alimentos Detetados */}
            <div className="space-y-2 border-t border-zinc-800 pt-4">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">Grelhado de Frango (Chicken Breast)</span>
                <span className="text-zinc-400 font-semibold">180g</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">Arroz Cozido (Cooked Rice)</span>
                <span className="text-zinc-400 font-semibold">150g</span>
              </div>
            </div>

            {/* Rácio Nutricional Mock */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800 text-[10px] text-zinc-500">
              <div className="text-center bg-zinc-950 p-1.5 rounded-lg border border-zinc-850">
                <span className="block font-bold text-emerald-400">54g</span>
                Proteína
              </div>
              <div className="text-center bg-zinc-950 p-1.5 rounded-lg border border-zinc-850">
                <span className="block font-bold text-indigo-400">42g</span>
                Hidratos
              </div>
              <div className="text-center bg-zinc-950 p-1.5 rounded-lg border border-zinc-850">
                <span className="block font-bold text-orange-400">6.5g</span>
                Gordura
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="bg-zinc-900 border-y border-zinc-850 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Como Funciona o CalTracker</h2>
            <p className="text-sm text-zinc-400">
              Combinamos inteligência artificial multimodal com cálculo matemático rígido para resultados ótimos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-3xl space-y-4">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Foto ou Texto Livre</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Tire uma fotografia do prato ou simplesmente escreva o que comeu (ex: "300g frango cru e arroz cozido").
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-3xl space-y-4">
              <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Reconhecimento Gemini</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                O Gemini identifica os tipos de alimento e estima os pesos aproximados em gramas em fração de segundo.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-3xl space-y-4">
              <div className="h-10 w-10 bg-orange-500/10 border border-orange-500/25 rounded-2xl flex items-center justify-center text-orange-400">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Cálculo de Alta Precisão</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Fazemos o cálculo matemático das porções com base nos dados reais de nutrientes da USDA, sem palpites de IA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        <p>&copy; {new Date().getFullYear()} CalTracker IA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
