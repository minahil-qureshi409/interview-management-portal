"use server"; // This directive marks all functions in this file as Server Actions

import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function updateCandidateStatus(candidateId: number, status: ApplicationStatus) {
  try {
    await prisma.candidate.update({
      where: {
        id: candidateId,
      },
      data: {
        status: status,
      },
    });
    
    // Revalidate the cache for these paths to show the updated data instantly
    revalidatePath(`/hr/applications`);
    revalidatePath(`/hr/applications/${candidateId}`);

    return { success: true, message: `Status updated to ${status}` };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update status." };
  }
}