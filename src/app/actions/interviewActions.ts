"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Define the structure of the interview data
interface InterviewFormData {
  interviewDate: string; // easier for form inputs
  interviewType: string;
  interviewerName: string;
  meetLink?: string;
  notes?: string;
}

export async function scheduleInterview(candidateId: number, formData: InterviewFormData) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.interview.create({
        data: {
          candidateId,
          interviewDate: new Date(formData.interviewDate), // convert from string
          interviewType: formData.interviewType,
          interviewerName: formData.interviewerName,
          meetLink: formData.meetLink || null,
          notes: formData.notes || null,
        },
      });

      await tx.candidate.update({
        where: { id: candidateId },
        data: { status: "INTERVIEW_SCHEDULED" },
      });
    });

    revalidatePath("/hr/applications");
    revalidatePath("/hr/interviews");

    return { success: true, message: "Interview scheduled successfully!" };
  } catch (error) {
    console.error("Failed to schedule interview:", error);
    return { success: false, message: "Failed to schedule interview." };
  }
}

export async function rejectCandidate(candidateId: number) {
  try {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "REJECTED" },
    });

    revalidatePath("/hr/applications");
    revalidatePath("/hr/interviews");

    return { success: true, message: "Candidate has been rejected." };
  } catch (error) {
    console.error("Failed to reject candidate:", error);
    return { success: false, message: "Failed to reject candidate." };
  }
}

export async function moveToApplied(candidateId: number) {
  try {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "APPLIED" },
    });

    revalidatePath("/hr/applications");
    revalidatePath("/hr/interviews");

    return { success: true, message: "Candidate moved back to applications." };
  } catch (error) {
    console.error("Failed to move candidate:", error);
    return { success: false, message: "Failed to move candidate." };
  }
}

export async function hireCandidate(candidateId: number) {
  try {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "HIRED" },
    });

    revalidatePath("/hr/applications");
    revalidatePath("/hr/interviews");

    return { success: true, message: "Candidate has been hired successfully!" };
  } catch (error) {
    console.error("Failed to hire candidate:", error);
    return { success: false, message: "Failed to hire candidate." };
  }
}
