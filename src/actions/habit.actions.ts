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

export async function getHabits() {
  const userId = await getUserId();
  return prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        orderBy: { date: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createHabit(data: {
  title: string;
  category?: string;
  frequency: string;
  targetCount?: number;
}) {
  const userId = await getUserId();
  const habit = await prisma.habit.create({
    data: {
      ...data,
      userId,
    }
  });
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return habit;
}

export async function toggleHabitLog(habitId: string, dateStr: string) {
  const userId = await getUserId();
  
  // Verify habit belongs to user
  const habit = await prisma.habit.findUnique({
    where: { id: habitId, userId }
  });
  
  if (!habit) throw new Error("Not found");

  const date = new Date(dateStr);
  // Ensure date is midnight UTC to avoid timezone drift in logs
  date.setUTCHours(0,0,0,0);

  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId,
      date,
    }
  });

  if (existingLog) {
    // Toggle completion status or delete
    await prisma.habitLog.delete({
      where: { id: existingLog.id }
    });
  } else {
    // Create new log
    await prisma.habitLog.create({
      data: {
        habitId,
        date,
        completed: true,
      }
    });
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function deleteHabit(id: string) {
  const userId = await getUserId();
  await prisma.habit.delete({
    where: { id, userId }
  });
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}
