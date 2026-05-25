import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MealForm from "@/components/MealForm";

interface EditMealPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMealPage({ params }: EditMealPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    return notFound();
  }

  const { id } = await params;

  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      foodItems: true,
    },
  });

  if (!meal) {
    return notFound();
  }

  // Verificar propriedade da refeição
  if (meal.userId !== user.id) {
    return notFound();
  }

  return <MealForm initialMeal={meal} />;
}
