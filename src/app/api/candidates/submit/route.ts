import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CandidateInput } from "@/types/candidate";
import { Prisma } from "@prisma/client";

// A simple helper function to generate a unique candidate ID
const generateCandidateId = async () => {
  // Get the count of existing candidates to create a padded ID
  const count = await prisma.candidate.count();
  // Format: C-YYYY-00001
  const year = new Date().getFullYear();
  const paddedCount = (count + 1).toString().padStart(5, '0');
  return `C-${year}-${paddedCount}`;
}

export async function POST(req: Request) {
  try {
    const data: CandidateInput = await req.json();

    // --> UPDATE 1: Generate the unique Candidate ID
    const candidateId = await generateCandidateId();

    console.log("📩 Incoming candidate data:", JSON.stringify(data, null, 2));
    console.log("🧩 Prisma payload prepared:", {
      candidateId,
      firstName: data.firstName,
      email: data.email,
    });


    const candidate = await prisma.candidate.create({
      data: {
        // --> UPDATE 2: Add the new fields here
        candidateId: candidateId,
        skills: data.skills || [], // Save the skills array, default to empty array

        // Your existing fields are perfect
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        title: data.title,
        company: data.company,
        moreInfo: data.moreInfo,

        // Your nested writes for relations are perfect, no changes needed
        workExperience: {
          create: data.workExperience?.map((w) => ({
            companyName: w.companyName,
            title: w.title,
            fromDate: new Date(w.fromDate),
            endDate: w.endDate ? new Date(w.endDate) : null,
            country: w.country,
            responsibilities: w.responsibilities,
          })),
        },
        education: {
          create: data.education?.map((e) => ({
            institute: e.institute,
            degree: e.degree,
            major: e.major,
            fromDate: e.fromDate ? new Date(e.fromDate) : null,
            endDate: e.endDate ? new Date(e.endDate) : null,
            country: e.country,
          })),
        },
        languageSkills: {
          create: data.languageSkills?.map((l) => ({
            language: l.language,
            speaking: l.speaking,
            reading: l.reading,
            writing: l.writing,
          })),
        },
        travelMobility: {
          create: data.travelMobility?.map((t) => ({
            willingToRelocate: t.willingToRelocate,
            availabilityForTravel: t.availabilityForTravel,
          })),
        },
        documents: {
          create: data.documents?.map((d) => ({
            // Note: This assumes you handle file uploads elsewhere
            // and `fileUrl` is available in the request body.
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            fileType: d.fileType,
          })),
        },
      },
    });

    return NextResponse.json(
      { message: "Candidate saved successfully", candidate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving candidate:", error);
    

    // Provide a more specific error for unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The error code for a unique constraint violation is P2002
      if (error.code === 'P2002') {
        // The 'meta' property tells us which field caused the error
        const target = error.meta?.target as string[];
        if (target?.includes('email')) {
          return NextResponse.json(
            { error: "A candidate with this email already exists." },
            { status: 409 } // 409 Conflict is a good status code for this
          );
        }
      }
    }

    return NextResponse.json({ error: "Failed to save candidate" }, { status: 500 });
  }
}


