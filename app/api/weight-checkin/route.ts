import { NextResponse } from "next/server";
import { getSessionUserId, calculateDailyCalories } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { weight } = body;

    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      return NextResponse.json({ error: "Peso inválido." }, { status: 400 });
    }

    const numWeight = parseFloat(weight);

    // Fetch current user data to recalculate calories
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        height: true,
        age: true,
        gender: true,
        goal: true,
        autoCalories: true,
        dailyCalories: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    }

    let newDailyCalories = user.dailyCalories;
    if (user.autoCalories) {
      newDailyCalories = calculateDailyCalories(
        numWeight,
        user.height,
        user.age,
        user.gender,
        user.goal
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        weight: numWeight,
        dailyCalories: newDailyCalories,
        lastWeightCheckIn: new Date(),
      },
      select: {
        id: true,
        weight: true,
        dailyCalories: true,
        lastWeightCheckIn: true,
      },
    });

    return NextResponse.json({
      message: "Peso atualizado com sucesso.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro no check-in de peso:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar o peso." },
      { status: 500 }
    );
  }
}
