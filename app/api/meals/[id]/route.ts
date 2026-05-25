import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSharedFoods } from "@/lib/sharedFoods";

// Obter uma refeição específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        foodItems: true,
      },
    });

    if (!meal) {
      return NextResponse.json({ error: "Refeição não encontrada." }, { status: 404 });
    }

    if (meal.userId !== userId) {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    return NextResponse.json({ meal });
  } catch (error) {
    console.error("Erro ao obter refeição:", error);
    return NextResponse.json(
      { error: "Erro ao obter refeição." },
      { status: 500 }
    );
  }
}

// Atualizar refeição existente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se a refeição existe e pertence ao utilizador
    const existingMeal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!existingMeal) {
      return NextResponse.json({ error: "Refeição não encontrada." }, { status: 404 });
    }

    if (existingMeal.userId !== userId) {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const body = await request.json();
    const { name, date, foodItems } = body;

    if (!name || !foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return NextResponse.json(
        { error: "Nome da refeição e alimentos são obrigatórios." },
        { status: 400 }
      );
    }

    // Calcular o total de calorias
    const totalCalories = Math.round(
      foodItems.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0)
    );

    const mealDate = date ? new Date(date) : new Date();

    // Atualização em transação para garantir atomicidade
    const updatedMeal = await prisma.$transaction(async (tx) => {
      // 1. Apagar os food items anteriores
      await tx.foodItem.deleteMany({
        where: { mealId: id },
      });

      // 2. Atualizar a refeição e criar novos food items
      return await tx.meal.update({
        where: { id },
        data: {
          name,
          date: mealDate,
          totalCalories,
          foodItems: {
            create: foodItems.map((item) => ({
              name: item.name,
              weightGrams: parseFloat(item.weightGrams) || 0,
              calories: parseFloat(item.calories) || 0,
              protein: parseFloat(item.protein) || 0,
              fat: parseFloat(item.fat) || 0,
              carbs: parseFloat(item.carbs) || 0,
            })),
          },
        },
        include: {
          foodItems: true,
        },
      });
    });

    // Guardar alimentos na base de dados partilhada global
    await saveSharedFoods(foodItems);

    return NextResponse.json({
      message: "Refeição atualizada com sucesso.",
      meal: updatedMeal,
    });
  } catch (error) {
    console.error("Erro ao atualizar refeição:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar a refeição." },
      { status: 500 }
    );
  }
}

// Apagar refeição
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se a refeição existe e pertence ao utilizador
    const existingMeal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!existingMeal) {
      return NextResponse.json({ error: "Refeição não encontrada." }, { status: 404 });
    }

    if (existingMeal.userId !== userId) {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    // Apagar a refeição (Prisma irá cascade-delete os food items associados)
    await prisma.meal.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Refeição eliminada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao eliminar refeição:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao eliminar a refeição." },
      { status: 500 }
    );
  }
}
