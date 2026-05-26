import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_for_caltracker_2026";
const COOKIE_NAME = "caltracker_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function signToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Obter o ID do utilizador autenticado a partir dos cookies do request (Server Component ou API route)
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifyToken(token);
  return verified ? verified.userId : null;
}

// Obter o utilizador completo autenticado
export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
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
        lastWeightCheckIn: true,
        createdAt: true,
      },
    });
  } catch (error) {
    return null;
  }
}

// Definir o cookie de sessão no login/registo
export async function setSessionCookie(userId: string) {
  const token = signToken({ userId });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });
}

// Limpar o cookie de sessão no logout
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Fórmula Harris-Benedict simplificada para estimar as necessidades diárias de calorias
export function calculateDailyCalories(
  weight: number,
  height: number,
  age: number,
  gender: string,
  goal: string
): number {
  // BMR (Taxa Metabólica Basal)
  let bmr = 0;
  if (gender.toLowerCase() === "masculino") {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    // Feminino / Outro (usa BMR feminino para estimativa padrão de outro)
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }

  // Multiplicador de atividade moderada por padrão (1.375)
  const maintenance = Math.round(bmr * 1.375);

  // Ajuste consoante o objetivo
  if (goal === "perder") {
    return Math.round(maintenance - 500); // Défice de 500 kcal
  } else if (goal === "ganhar") {
    return Math.round(maintenance + 350); // Superávit de 350 kcal
  } else {
    return maintenance; // Manter peso
  }
}
