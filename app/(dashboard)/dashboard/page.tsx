import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Plus, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  Flame, 
  Apple, 
  Clock 
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Obter início e fim do dia atual do utilizador em UTC
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Procurar as refeições de hoje
  const meals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      foodItems: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calcular totais consumidos hoje
  let totalCaloriesEaten = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  meals.forEach((meal) => {
    totalCaloriesEaten += meal.totalCalories;
    meal.foodItems.forEach((item) => {
      totalProtein += item.protein;
      totalFat += item.fat;
      totalCarbs += item.carbs;
    });
  });

  totalProtein = Math.round(totalProtein * 10) / 10;
  totalFat = Math.round(totalFat * 10) / 10;
  totalCarbs = Math.round(totalCarbs * 10) / 10;

  // Metas de Macronutrientes personalizadas baseadas no peso do utilizador
  // Proteína: 2g por kg
  const targetProtein = Math.round(user.weight * 2.0);
  // Gordura: 1g por kg
  const targetFat = Math.round(user.weight * 1.0);
  // Hidratos: O restante das calorias recomendadas
  const proteinKcal = targetProtein * 4;
  const fatKcal = targetFat * 9;
  const remainingKcal = Math.max(0, user.dailyCalories - (proteinKcal + fatKcal));
  const targetCarbs = Math.round(remainingKcal / 4);

  // Resto de calorias
  const caloriesRemaining = user.dailyCalories - totalCaloriesEaten;
  const caloriesPercentage = Math.min(100, Math.round((totalCaloriesEaten / user.dailyCalories) * 100));

  // Percentagem das macros
  const proteinPercentage = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const fatPercentage = Math.min(100, Math.round((totalFat / targetFat) * 100));
  const carbsPercentage = Math.min(100, Math.round((totalCarbs / targetCarbs) * 100));

  // Circunferência para o círculo de progresso SVG (r=50, c=2*pi*r ≈ 314)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriesPercentage / 100) * circumference;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Secção de Saudação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Olá, <span className="text-gradient bg-gradient-to-r from-emerald-400 to-orange-400 bg-clip-text text-transparent">{user.name}</span>!
          </h1>
          <p className="text-zinc-400 mt-1">
            Hoje é dia {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}.
          </p>
        </div>
        <Link
          href="/meals/add"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm w-full md:w-auto"
        >
          <Plus className="h-5 w-5" />
          Adicionar Refeição
        </Link>
      </div>

      {/* Grid Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Card do Progresso de Calorias Diárias */}
        <div className="lg:col-span-1 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-lg font-semibold text-zinc-400 mb-6 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Calorias Diárias
          </h2>

          <div className="relative flex items-center justify-center h-48 w-48">
            {/* SVG Circular Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-zinc-800 fill-none"
                strokeWidth="12"
              />
              {/* Foreground circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white">{totalCaloriesEaten}</span>
              <span className="text-zinc-500 text-xs mt-1">de {user.dailyCalories} kcal</span>
              <span className="text-emerald-400 text-xs font-semibold mt-1">
                {caloriesPercentage}%
              </span>
            </div>
          </div>

          <div className="mt-6 w-full text-center">
            {caloriesRemaining >= 0 ? (
              <p className="text-sm text-zinc-400">
                Ainda podes consumir <strong className="text-white text-base">{caloriesRemaining} kcal</strong> hoje.
              </p>
            ) : (
              <p className="text-sm text-orange-400 font-medium">
                Excedeste o teu objetivo em <strong className="text-orange-500 text-base">{Math.abs(caloriesRemaining)} kcal</strong>!
              </p>
            )}
          </div>
        </div>

        {/* Card do Progresso dos Macronutrientes */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between shadow-2xl relative">
          <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <h2 className="text-lg font-semibold text-zinc-400 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Macronutrientes Consumidos
            </h2>

            <div className="space-y-6">
              {/* Proteína */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Proteína
                  </span>
                  <span className="text-zinc-400">
                    <strong className="text-white">{totalProtein}g</strong> / {targetProtein}g
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${proteinPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Meta base (2g/kg)</span>
                  <span>{proteinPercentage}% concluído</span>
                </div>
              </div>

              {/* Hidratos de Carbono */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    Hidratos de Carbono
                  </span>
                  <span className="text-zinc-400">
                    <strong className="text-white">{totalCarbs}g</strong> / {targetCarbs}g
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                    style={{ width: `${carbsPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Meta energética</span>
                  <span>{carbsPercentage}% concluído</span>
                </div>
              </div>

              {/* Gorduras */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Gorduras / Lípidos
                  </span>
                  <span className="text-zinc-400">
                    <strong className="text-white">{totalFat}g</strong> / {targetFat}g
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000"
                    style={{ width: `${fatPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Meta de lípidos (1g/kg)</span>
                  <span>{fatPercentage}% concluído</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
              Rácio de metas ajustado ao teu peso atual ({user.weight} kg)
            </span>
          </div>
        </div>
      </div>

      {/* Secção de Refeições de Hoje */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Apple className="h-5 w-5 text-emerald-400" />
            Refeições de Hoje
          </h2>
          <span className="text-xs font-semibold bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full">
            {meals.length} {meals.length === 1 ? "refeição" : "refeições"} registada(s)
          </span>
        </div>

        {meals.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-4">
              <Apple className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-300">Nenhuma refeição adicionada hoje</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs">
              Alimente o CalTracker escrevendo o que comeu ou tirando uma fotografia com o seu telemóvel.
            </p>
            <Link
              href="/meals/add"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Começar a registar agora
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Meal List */
          <div className="space-y-4">
            {meals.map((meal) => (
              <div 
                key={meal.id} 
                className="rounded-2xl bg-zinc-950 border border-zinc-850 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-800 transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-white text-base">{meal.name}</h3>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(meal.date).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Lisbon"
                      })}
                    </span>
                  </div>

                  {/* Lista de alimentos individuais nesta refeição */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
                    {meal.foodItems.map((item, idx) => (
                      <span key={item.id} className="flex items-center">
                        {item.name} ({item.weightGrams}g)
                        {idx < meal.foodItems.length - 1 && <span className="text-zinc-600 ml-3">•</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Macronutrientes e Calorias totais da refeição */}
                <div className="flex items-center gap-4 border-t sm:border-t-0 border-zinc-800/60 pt-3 sm:pt-0 justify-between sm:justify-end">
                  <div className="flex gap-3 text-xs text-zinc-500">
                    <span className="flex flex-col text-center sm:text-right">
                      <span className="text-[10px] text-zinc-600 uppercase font-semibold">P</span>
                      <strong className="text-zinc-300">
                        {meal.foodItems.reduce((acc, cur) => acc + cur.protein, 0).toFixed(1)}g
                      </strong>
                    </span>
                    <span className="flex flex-col text-center sm:text-right">
                      <span className="text-[10px] text-zinc-600 uppercase font-semibold">H</span>
                      <strong className="text-zinc-300">
                        {meal.foodItems.reduce((acc, cur) => acc + cur.carbs, 0).toFixed(1)}g
                      </strong>
                    </span>
                    <span className="flex flex-col text-center sm:text-right">
                      <span className="text-[10px] text-zinc-600 uppercase font-semibold">G</span>
                      <strong className="text-zinc-300">
                        {meal.foodItems.reduce((acc, cur) => acc + cur.fat, 0).toFixed(1)}g
                      </strong>
                    </span>
                  </div>
                  <div className="text-right pl-4 border-l border-zinc-800/80">
                    <span className="text-2xl font-extrabold text-orange-400">{meal.totalCalories}</span>
                    <span className="text-[10px] text-zinc-500 block">kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
