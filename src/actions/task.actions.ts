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

export async function getTasks() {
  const userId = await getUserId();
  return prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  matrixColumn?: number;
  priority?: string;
  deadline?: Date;
  estimatedDuration?: number;
  category?: string;
}) {
  const userId = await getUserId();
  const task = await prisma.task.create({
    data: {
      ...data,
      userId,
    }
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/priority");
  return task;
}

export async function updateTaskStatus(id: string, status: string) {
  const userId = await getUserId();
  const task = await prisma.task.update({
    where: { id, userId },
    data: { 
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    }
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/priority");
  return task;
}

export async function postponeTask(id: string) {
  const userId = await getUserId();
  const task = await prisma.task.update({
    where: { id, userId },
    data: { 
      status: "POSTPONED",
      postponeCount: { increment: 1 }
    }
  });
  revalidatePath("/tasks");
  return task;
}

export async function deleteTask(id: string) {
  const userId = await getUserId();
  await prisma.task.delete({
    where: { id, userId }
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/priority");
}
