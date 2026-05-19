import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie, calculateDailyCalories } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, weight, height, age, gender, goal } = body;

    // Validação básica
    if (!name || !email || !password || !weight || !height || !age || !gender || !goal) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A palavra-passe deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está registado." },
        { status: 400 }
      );
    }

    // Calcular calorias alvo base
    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);
    const numAge = parseInt(age);

    if (isNaN(numWeight) || isNaN(numHeight) || isNaN(numAge)) {
      return NextResponse.json(
        { error: "Os valores biométricos devem ser numéricos." },
        { status: 400 }
      );
    }

    const calculatedCalories = calculateDailyCalories(
      numWeight,
      numHeight,
      numAge,
      gender,
      goal
    );

    // Hashing da password
    const passwordHash = await hashPassword(password);

    // Criar utilizador
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        weight: numWeight,
        height: numHeight,
        age: numAge,
        gender,
        goal,
        dailyCalories: calculatedCalories,
      },
    });

    // Definir cookie
    await setSessionCookie(user.id);

    return NextResponse.json(
      {
        message: "Registo efetuado com sucesso.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          dailyCalories: user.dailyCalories,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no registo:", error);
    return NextResponse.json(
      { 
        error: "Erro interno no servidor.",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
