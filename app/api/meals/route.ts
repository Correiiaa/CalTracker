import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSharedFoods } from "@/lib/sharedFoods";

// Criar refeição
export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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

    const meal = await prisma.meal.create({
      data: {
        userId,
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

    // Guardar alimentos na base de dados partilhada global
    await saveSharedFoods(foodItems);

    return NextResponse.json({
      message: "Refeição guardada com sucesso.",
      meal,
    });
  } catch (error) {
    console.error("Erro ao guardar refeição:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao guardar a refeição." },
      { status: 500 }
    );
  }
}

// Listar refeições
export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // Formato YYYY-MM-DD
    const limitStr = searchParams.get("limit");

    let whereClause: any = { userId };

    if (dateStr) {
      const start = new Date(dateStr);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(dateStr);
      end.setUTCHours(23, 59, 59, 999);

      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    const limit = limitStr ? parseInt(limitStr) : undefined;

    const meals = await prisma.meal.findMany({
      where: whereClause,
      include: {
        foodItems: true,
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ meals });
  } catch (error) {
    console.error("Erro ao listar refeições:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao listar as refeições." },
      { status: 500 }
    );
  }
}
