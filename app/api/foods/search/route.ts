import { NextResponse } from "next/server";
import { searchUSDAFoods } from "@/lib/nutrition";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || !query.trim()) {
    return NextResponse.json({ foods: [] });
  }

  try {
    const foods = await searchUSDAFoods(query);
    return NextResponse.json({ foods });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
