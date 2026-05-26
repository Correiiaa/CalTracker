import { NextResponse } from "next/server";
import { getSessionUserId, calculateDailyCalories } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { name, weight, height, age, gender, goal, dailyCalories, autoCalories } = body;

    if (!name || !weight || !height || !age || !gender || !goal) {
      return NextResponse.json(
        { error: "Nome, peso, altura, idade, género e objetivo são obrigatórios." },
        { status: 400 }
      );
    }

    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);
    const numAge = parseInt(age);

    if (isNaN(numWeight) || isNaN(numHeight) || isNaN(numAge)) {
      return NextResponse.json(
        { error: "Peso, altura e idade devem ser valores numéricos." },
        { status: 400 }
      );
    }

    // Se o cálculo automático está ligado ou não foi definido autoCalories (default true)
    const isAuto = autoCalories !== false;
    let targetCalories = parseInt(dailyCalories);

    if (isAuto) {
      targetCalories = calculateDailyCalories(
        numWeight,
        numHeight,
        numAge,
        gender,
        goal
      );
    } else {
      if (isNaN(targetCalories) || targetCalories <= 0) {
        return NextResponse.json(
          { error: "Meta de calorias inválida para modo manual." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        weight: numWeight,
        height: numHeight,
        age: numAge,
        gender,
        goal,
        dailyCalories: targetCalories,
        autoCalories: isAuto,
        lastWeightCheckIn: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        weight: true,
        height: true,
        age: true,
        gender: true,
        goal: true,
        dailyCalories: true,
        autoCalories: true,
      },
    });

    return NextResponse.json({
      message: "Perfil atualizado com sucesso.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar o perfil." },
      { status: 500 }
    );
  }
}
