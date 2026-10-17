"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) throw new Error("Unauthorized");
  return (session!.user as any).id as string;
}

export async function getTimeLogs() {
  const userId = await getUserId();
  return prisma.timeLog.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' }
  });
}

export async function createTimeLog(data: {
  activity: string;
  category?: string;
  duration?: number; // in minutes
  startTime: Date;
  endTime?: Date;
  productivityRating?: number;
  notes?: string;
}) {
  const userId = await getUserId();
  
  const end = data.endTime || new Date(data.startTime.getTime() + (data.duration || 60) * 60000);
  const duration = data.duration || Math.round((end.getTime() - data.startTime.getTime()) / 60000);

  const log = await prisma.timeLog.create({
    data: {
      ...data,
      endTime: end,
      duration,
      userId,
    }
  });
  revalidatePath("/timelog");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return log;
}

export async function updateTimeLog(id: string, data: {
  activity: string;
  category?: string;
  startTime: Date;
  endTime: Date;
}) {
  const userId = await getUserId();
  const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000);

  const log = await prisma.timeLog.update({
    where: { id, userId },
    data: {
      ...data,
      duration
    }
  });
  revalidatePath("/timelog");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return log;
}

export async function deleteTimeLog(id: string) {
  const userId = await getUserId();
  await prisma.timeLog.delete({
    where: { id, userId }
  });
  revalidatePath("/timelog");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
}
