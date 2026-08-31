"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getGoals() {
  const userId = await getUserId();
  return prisma.goal.findMany({
    where: { userId },
    include: {
      tasks: {
        select: { id: true, status: true }
      },
      habits: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createGoal(data: {
  title: string;
  description?: string;
  level: string; // LONG_TERM, MEDIUM_TERM, SHORT_TERM
  targetDate?: Date;
}) {
  const userId = await getUserId();
  const goal = await prisma.goal.create({
    data: {
      ...data,
      userId,
    }
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function updateGoalProgress(id: string, progress: number) {
  const userId = await getUserId();
  const goal = await prisma.goal.update({
    where: { id, userId },
    data: { progress }
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function deleteGoal(id: string) {
  const userId = await getUserId();
  await prisma.goal.delete({
    where: { id, userId }
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}
