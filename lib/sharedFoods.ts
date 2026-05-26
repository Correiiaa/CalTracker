import { prisma } from "./prisma";

interface FoodItemInput {
  name: string;
  weightGrams: number | string;
  calories: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
  unit?: string;
}

export async function saveSharedFoods(foodItems: FoodItemInput[]) {
  for (const item of foodItems) {
    const qty = parseFloat(item.weightGrams as string) || 1;
    if (qty <= 0) continue;

    const unit = item.unit === "un" ? "un" : "g";

    // Se for unidade, guardamos os valores por 1 unidade. Se for gramas, por 100g.
    const factor = unit === "un" ? (1 / qty) : (100 / qty);
    const name = item.name.trim();
    const caloriesPer100g = Math.round((parseFloat(item.calories as string) || 0) * factor * 10) / 10;
    const proteinPer100g = Math.round((parseFloat(item.protein as string) || 0) * factor * 10) / 10;
    const fatPer100g = Math.round((parseFloat(item.fat as string) || 0) * factor * 10) / 10;
    const carbsPer100g = Math.round((parseFloat(item.carbs as string) || 0) * factor * 10) / 10;

    try {
      // Procurar por nome e unidade de forma case-insensitive no nome
      const existing = await prisma.sharedFood.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          unit: unit,
        },
      });

      if (existing) {
        // Atualizar se já existe para manter valores mais atualizados
        await prisma.sharedFood.update({
          where: { id: existing.id },
          data: {
            caloriesPer100g,
            proteinPer100g,
            fatPer100g,
            carbsPer100g,
          },
        });
      } else {
        // Criar novo alimento global
        await prisma.sharedFood.create({
          data: {
            name,
            unit,
            caloriesPer100g,
            proteinPer100g,
            fatPer100g,
            carbsPer100g,
          },
        });
      }
    } catch (error) {
      console.error(`Erro ao guardar alimento partilhado "${name}" (${unit}):`, error);
    }
  }
}
