// src/app/actions/InterviewActions.ts

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

export async function scheduleInterview(candidateId: number, formData: InterviewFormData, interviewId?: number) {
  try {
    const dataToSave = {
      candidateId,
      interviewDate: new Date(formData.interviewDate),
      interviewType: formData.interviewType,
      interviewerName: formData.interviewerName,
      meetLink: formData.meetLink || null,
      notes: formData.notes || null,
    };

    await prisma.$transaction(async (tx) => {
      if (interviewId) {
        // --- UPDATE LOGIC ---
        console.log(`Updating interview with ID: ${interviewId}`);
        await tx.interview.update({
          where: { id: interviewId },
          data: dataToSave,
        });
      } else {
        // --- CREATE LOGIC (as before) ---
        console.log(`Creating new interview for candidate ID: ${candidateId}`);
        await tx.interview.create({ data: dataToSave });
      }

      // Ensure candidate status is set correctly
      await tx.candidate.update({
        where: { id: candidateId },
        data: { status: "INTERVIEW_SCHEDULED" },
      });
    });

    revalidatePath(`/hr/applications/${candidateId}`);
    revalidatePath("/hr/interviews");

    const message = interviewId ? "Interview updated successfully!" : "Interview scheduled successfully!";
    return { success: true, message };
  } catch (error) {
    console.error("Failed to schedule/update interview:", error);
    return { success: false, message: "Failed to schedule/update interview." };
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
    await prisma.$transaction(async (tx) => {
      // 1. Update candidate status
      await tx.candidate.update({
        where: { id: candidateId },
        data: { status: "APPLIED" },
      });
      // 2. --- NEW: Delete all interviews for this candidate ---
      await tx.interview.deleteMany({
        where: { candidateId: candidateId },
      });
    });

    revalidatePath(`/hr/applications/${candidateId}`);
    revalidatePath("/hr/interviews");

    return { success: true, message: "Interview cancelled and candidate moved back to applications." };
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

export async function completeInterview(interviewId: number, feedback: string) {
  try {
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) throw new Error("Interview not found");

    await prisma.$transaction(async (tx) => {
      // 1. Add feedback to the interview record
      await tx.interview.update({
        where: { id: interviewId },
        data: { feedback },
      });

      // 2. Update the candidate's status
      await tx.candidate.update({
        where: { id: interview.candidateId },
        data: { status: 'INTERVIEW_COMPLETED' },
      });
    });

    revalidatePath(`/hr/applications/${interview.candidateId}`);
    revalidatePath('/hr/interviews');

    return { success: true, message: "Feedback submitted and interview completed." };
  } catch (error) {
    console.error("Failed to complete interview:", error);
    return { success: false, message: "Failed to submit feedback." };
  }
}
