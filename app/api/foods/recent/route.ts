import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Obter as últimas 30 refeições do utilizador
    const meals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
      include: {
        foodItems: true,
      },
    });

    // Mapear os alimentos individuais consumidos e deduplicá-los por nome
    const uniqueFoodsMap = new Map<string, any>();

    for (const meal of meals) {
      for (const item of meal.foodItems) {
        const lowerName = item.name.trim().toLowerCase();
        if (uniqueFoodsMap.has(lowerName)) continue;

        // Converter macros de volta para "por 100g" para re-uso flexível no cliente
        const weight = item.weightGrams || 100;
        const factor = 100 / weight;

        uniqueFoodsMap.set(lowerName, {
          name: item.name,
          caloriesPer100g: Math.round(item.calories * factor * 10) / 10,
          proteinPer100g: Math.round(item.protein * factor * 10) / 10,
          fatPer100g: Math.round(item.fat * factor * 10) / 10,
          carbsPer100g: Math.round(item.carbs * factor * 10) / 10,
        });
      }
    }

    // Converter para array e limitar a 15 alimentos mais recentes
    const recentFoods = Array.from(uniqueFoodsMap.values()).slice(0, 15);

    return NextResponse.json({ recentFoods });
  } catch (error) {
    console.error("Erro ao obter alimentos recentes:", error);
    return NextResponse.json(
      { error: "Erro ao carregar histórico de alimentos." },
      { status: 500 }
    );
  }
}
