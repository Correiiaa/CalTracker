import { prisma } from "./prisma";

interface FoodItemInput {
  name: string;
  weightGrams: number | string;
  calories: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
}

export async function saveSharedFoods(foodItems: FoodItemInput[]) {
  for (const item of foodItems) {
    const weight = parseFloat(item.weightGrams as string) || 100;
    if (weight <= 0) continue;

    // Normalizar nutrientes para 100g
    const factor = 100 / weight;
    const name = item.name.trim();
    const caloriesPer100g = Math.round((parseFloat(item.calories as string) || 0) * factor * 10) / 10;
    const proteinPer100g = Math.round((parseFloat(item.protein as string) || 0) * factor * 10) / 10;
    const fatPer100g = Math.round((parseFloat(item.fat as string) || 0) * factor * 10) / 10;
    const carbsPer100g = Math.round((parseFloat(item.carbs as string) || 0) * factor * 10) / 10;

    try {
      // Procurar por nome de forma case-insensitive
      const existing = await prisma.sharedFood.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
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
            caloriesPer100g,
            proteinPer100g,
            fatPer100g,
            carbsPer100g,
          },
        });
      }
    } catch (error) {
      console.error(`Erro ao guardar alimento partilhado "${name}":`, error);
    }
  }
}
