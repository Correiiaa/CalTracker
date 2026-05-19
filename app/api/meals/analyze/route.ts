import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUserId } from "@/lib/auth";
import { parseMealText, analyzeMealImage, processNutritionAnalysis } from "@/lib/nutrition";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

// Função para guardar imagem Base64 localmente
function saveBase64Image(base64Str: string): string {
  // O ambiente Vercel é Read-Only. Não podemos guardar no disco.
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "";
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = "jpg";
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      const mime = matches[1];
      buffer = Buffer.from(matches[2], "base64");
      if (mime === "image/png") ext = "png";
      else if (mime === "image/gif") ext = "gif";
      else if (mime === "image/webp") ext = "webp";
    } else {
      buffer = Buffer.from(base64Str, "base64");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `meal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Erro ao guardar imagem localmente:", error);
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { type, query, image } = body;

    if (!type || (type !== "text" && type !== "image")) {
      return NextResponse.json(
        { error: "Tipo de análise inválido (deve ser 'text' ou 'image')." },
        { status: 400 }
      );
    }

    // 1. Caso seja texto
    if (type === "text") {
      if (!query || query.trim() === "") {
        return NextResponse.json(
          { error: "A descrição de texto é obrigatória." },
          { status: 400 }
        );
      }

      const parsedItems = await parseMealText(query);
      if (parsedItems.length === 0) {
        return NextResponse.json(
          { error: "Não foi possível identificar alimentos no texto. Experimente reescrever." },
          { status: 400 }
        );
      }

      const analysisResult = await processNutritionAnalysis(parsedItems);
      return NextResponse.json(analysisResult);
    }

    // 2. Caso seja imagem
    if (type === "image") {
      if (!image) {
        return NextResponse.json(
          { error: "O ficheiro de imagem em Base64 é obrigatório." },
          { status: 400 }
        );
      }

      // Guardar a imagem localmente
      const imageUrl = saveBase64Image(image);

      // Enviar imagem para o Gemini analisar
      const { foods, confidence } = await analyzeMealImage(image);

      if (foods.length === 0) {
        return NextResponse.json(
          { error: "O Gemini não conseguiu detetar nenhum alimento nesta imagem." },
          { status: 400 }
        );
      }

      // Guardar log de análise de IA na base de dados
      await prisma.aIAnalysis.create({
        data: {
          userId,
          imageUrl,
          geminiResponse: JSON.stringify(foods),
          confidence,
        },
      });

      // Processar os alimentos encontrados pelo motor nutricional (USDA + Fallback + Contas)
      const analysisResult = await processNutritionAnalysis(foods);

      return NextResponse.json({
        ...analysisResult,
        imageUrl,
        confidence,
      });
    }
  } catch (error) {
    console.error("Erro na análise da refeição:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao processar a análise da refeição." },
      { status: 500 }
    );
  }
}
