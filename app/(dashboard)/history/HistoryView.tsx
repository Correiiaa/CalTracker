"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Flame, 
  Apple, 
  Loader2, 
  ChevronRight 
} from "lucide-react";

interface Meal {
  id: string;
  name: string;
  date: string;
  totalCalories: number;
  foodItems: {
    id: string;
    name: string;
    weightGrams: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }[];
}

interface HistoryViewProps {
  user: {
    id: string;
    dailyCalories: number;
    weight: number;
  };
  initialChartData: {
    date: string;
    label: string;
    calories: number;
  }[];
}

export function HistoryView({ user, initialChartData }: HistoryViewProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  // Definir data de hoje ao carregar
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  // Procurar refeições sempre que a data selecionada mudar
  useEffect(() => {
    if (!selectedDate) return;

    const fetchMeals = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/meals?date=${selectedDate}`);
        if (response.ok) {
          const data = await response.json();
          setMeals(data.meals || []);
        }
      } catch (error) {
        console.error("Erro ao obter refeições:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [selectedDate]);

  // Totais consumidos no dia selecionado
  let totalCals = 0;
  let totalProt = 0;
  let totalFat = 0;
  let totalCarb = 0;

  meals.forEach((m) => {
    totalCals += m.totalCalories;
    m.foodItems.forEach((i) => {
      totalProt += i.protein;
      totalFat += i.fat;
      totalCarb += i.carbs;
    });
  });

  totalProt = Math.round(totalProt * 10) / 10;
  totalFat = Math.round(totalFat * 10) / 10;
  totalCarb = Math.round(totalCarb * 10) / 10;

  // Desenho do gráfico SVG
  const maxCaloriesInChart = Math.max(
    ...initialChartData.map((d) => d.calories),
    user.dailyCalories,
    1500
  );
  
  const chartHeight = 160;
  const targetY = chartHeight - (user.dailyCalories / maxCaloriesInChart) * chartHeight;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Lado Esquerdo: Gráfico dos Últimos 7 Dias (Colunas 2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
          <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-lg font-semibold text-zinc-300 mb-6 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Consumo dos Últimos 7 Dias
          </h2>

          {/* Gráfico SVG customizado */}
          <div className="relative">
            <div className="flex justify-between items-end h-[160px] w-full px-2 relative border-b border-zinc-850">
              
              {/* Linha Meta de Calorias */}
              <div 
                className="absolute left-0 right-0 border-t border-dashed border-emerald-500/55 z-10 flex justify-end"
                style={{ top: `${targetY}px` }}
              >
                <span className="bg-zinc-900 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded -mt-2.5 mr-1 border border-zinc-800">
                  Meta: {user.dailyCalories} kcal
                </span>
              </div>

              {/* Colunas do Gráfico */}
              {initialChartData.map((day) => {
                const barHeight = (day.calories / maxCaloriesInChart) * chartHeight;
                const isSelected = selectedDate === day.date;
                const isOverLimit = day.calories > user.dailyCalories;

                return (
                  <div 
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className="flex flex-col items-center flex-1 cursor-pointer group"
                  >
                    {/* Tooltip no Hover */}
                    <span className="opacity-0 group-hover:opacity-100 absolute bg-zinc-950 text-[10px] text-zinc-200 font-bold px-2 py-1 rounded-lg border border-zinc-800 -translate-y-9 transition-opacity z-20 pointer-events-none">
                      {day.calories} kcal
                    </span>

                    {/* Barra */}
                    <div 
                      className="w-8 sm:w-10 rounded-t-xl transition-all duration-300 relative"
                      style={{ 
                        height: `${Math.max(6, barHeight)}px`,
                        background: isSelected 
                          ? "linear-gradient(to top, #10b981, #34d399)" 
                          : isOverLimit
                            ? "linear-gradient(to top, #ea580c, #f97316)"
                            : "linear-gradient(to top, #27272a, #3f3f46)"
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Rótulos de Dias */}
            <div className="flex justify-around mt-3 text-xs font-semibold text-zinc-500">
              {initialChartData.map((day) => {
                const isSelected = selectedDate === day.date;
                return (
                  <span 
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "text-emerald-400" : "hover:text-zinc-300"
                    }`}
                  >
                    {day.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fita Seletora de Dias Rápidos */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Selecionar Data
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Input de Data Nativo */}
            <div className="relative w-full sm:w-auto">
              <CalendarIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            {/* Botões Rápidos */}
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedDate === new Date().toISOString().split("T")[0]
                    ? "bg-zinc-800 text-emerald-400 border-zinc-700"
                    : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-200"
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setSelectedDate(yesterday.toISOString().split("T")[0]);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedDate === new Date(Date.now() - 86400000).toISOString().split("T")[0]
                    ? "bg-zinc-800 text-emerald-400 border-zinc-700"
                    : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-200"
                }`}
              >
                Ontem
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito: Histórico do Dia Selecionado (Coluna 1) */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Tabela do Resumo Nutricional do Dia */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-6">
          <h2 className="text-lg font-semibold text-white">
            Resumo do Dia
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Consumido</span>
              <strong className="text-xl font-extrabold text-white mt-1">{totalCals} kcal</strong>
            </div>
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Meta Diária</span>
              <strong className="text-xl font-extrabold text-zinc-400 mt-1">{user.dailyCalories} kcal</strong>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs border-b border-zinc-850 pb-2">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Proteínas
              </span>
              <strong className="text-zinc-200">{totalProt}g</strong>
            </div>
            <div className="flex justify-between text-xs border-b border-zinc-850 pb-2">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Hidratos
              </span>
              <strong className="text-zinc-200">{totalCarb}g</strong>
            </div>
            <div className="flex justify-between text-xs pb-1">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Gorduras
              </span>
              <strong className="text-zinc-200">{totalFat}g</strong>
            </div>
          </div>
        </div>

        {/* Lista de refeições do dia */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Refeições do Dia</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-zinc-850 rounded-2xl">
              <Apple className="h-7 w-7 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Nenhum registo para este dia.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {meals.map((meal) => (
                <div 
                  key={meal.id}
                  className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{meal.name}</h3>
                    <span className="text-xs font-extrabold text-orange-400">{meal.totalCalories} kcal</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(meal.date).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Lisbon"
                    })}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-zinc-500">
                    {meal.foodItems.map((item, idx) => (
                      <span key={item.id}>
                        {item.name} ({item.weightGrams}g)
                        {idx < meal.foodItems.length - 1 && <span className="text-zinc-700 ml-1.5">•</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
