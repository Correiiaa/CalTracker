import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMMON_FOODS } from "@/lib/commonFoods";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || !query.trim()) {
    try {
      const latestShared = await prisma.sharedFood.findMany({
        orderBy: { id: "desc" },
        take: 20,
      });
      const mappedShared = latestShared.map((food) => ({
        id: food.id,
        name: food.name,
        source: "Global" as const,
        unit: food.unit,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        fatPer100g: food.fatPer100g,
        carbsPer100g: food.carbsPer100g,
      }));
      return NextResponse.json({ foods: mappedShared });
    } catch (err: any) {
      return NextResponse.json({ foods: [] });
    }
  }

  const cleanQuery = query.trim().toLowerCase();

  try {
    // 1. Pesquisa na base de dados global (SharedFood)
    const sharedFoods = await prisma.sharedFood.findMany({
      where: {
        name: {
          contains: cleanQuery,
          mode: "insensitive",
        },
      },
      take: 20,
    });

    const mappedShared = sharedFoods.map((food) => ({
      id: food.id,
      name: food.name,
      source: "Global" as const,
      unit: food.unit,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      fatPer100g: food.fatPer100g,
      carbsPer100g: food.carbsPer100g,
    }));

    // 2. Pesquisa nos alimentos padrão locais (COMMON_FOODS)
    const removeAccents = (str: string) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const cleanQueryNoAccents = removeAccents(cleanQuery);

    const localMatches = COMMON_FOODS.filter((food) =>
      removeAccents(food.name).includes(cleanQueryNoAccents)
    );

    const mappedLocal = localMatches.map((food, idx) => ({
      id: `local-${idx}-${food.name}`,
      name: food.name,
      source: "Local" as const,
      unit: "g" as const,
      caloriesPer100g: food.calories,
      proteinPer100g: food.protein,
      fatPer100g: food.fat,
      carbsPer100g: food.carbs,
    }));

    // 3. Juntar os resultados locais e globais
    const foods = [...mappedLocal, ...mappedShared];

    return NextResponse.json({ foods });
  } catch (error: any) {
    console.error("Erro na pesquisa de alimentos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
