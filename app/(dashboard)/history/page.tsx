import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HistoryView } from "./HistoryView";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Obter o intervalo dos últimos 7 dias
  const startRange = new Date();
  startRange.setDate(startRange.getDate() - 6);
  startRange.setHours(0, 0, 0, 0);

  const endRange = new Date();
  endRange.setHours(23, 59, 59, 999);

  // Procurar todas as refeições do intervalo de 7 dias
  const recentMeals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startRange,
        lte: endRange,
      },
    },
    include: {
      foodItems: true,
    },
  });

  // Agrupar as calorias dos últimos 7 dias
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayLabel = d.toLocaleDateString("pt-PT", { weekday: "short" }).replace(".", "");

    // Filtrar refeições deste dia
    const dayMeals = recentMeals.filter((meal) => {
      const mealDateStr = new Date(meal.date).toISOString().split("T")[0];
      return mealDateStr === dateString;
    });

    const dayCalories = dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);

    chartData.push({
      date: dateString,
      label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      calories: dayCalories,
    });
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Histórico Nutricional</h1>
        <p className="text-zinc-400 mt-1">Veja a sua evolução e consulte refeições de dias passados.</p>
      </div>

      <HistoryView 
        user={user} 
        initialChartData={chartData} 
      />
    </div>
  );
}
