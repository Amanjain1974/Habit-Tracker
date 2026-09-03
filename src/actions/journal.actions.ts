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

export async function getJournalEntries() {
  const userId = await getUserId();
  return prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });
}

export async function saveJournalEntry(date: Date, content: string) {
  const userId = await getUserId();
  
  // Normalize date to start of day for uniqueness
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const entry = await prisma.journalEntry.upsert({
    where: {
      userId_date: {
        userId,
        date: normalizedDate
      }
    },
    update: {
      content
    },
    create: {
      userId,
      date: normalizedDate,
      content
    }
  });

  revalidatePath("/journal");
  return entry;
}
