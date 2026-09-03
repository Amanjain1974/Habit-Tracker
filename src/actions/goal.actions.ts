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
      },
      milestones: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function toggleMilestone(milestoneId: string, done: boolean) {
  const userId = await getUserId();
  // Ensure the milestone belongs to user's goal
  const milestone = await prisma.goalMilestone.findFirst({
    where: { id: milestoneId, goal: { userId } }
  });
  if (!milestone) throw new Error("Not found");
  
  await prisma.goalMilestone.update({
    where: { id: milestoneId },
    data: { done }
  });
  
  // Update goal progress automatically based on milestones if desired, 
  // or just leave it for now and calculate on frontend
  revalidatePath("/goals");
}

export async function createMilestone(goalId: string, title: string) {
  const userId = await getUserId();
  const goal = await prisma.goal.findUnique({ where: { id: goalId, userId }});
  if (!goal) throw new Error("Goal not found");
  
  const m = await prisma.goalMilestone.create({
    data: {
      title,
      goalId
    }
  });
  revalidatePath("/goals");
  return m;
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
