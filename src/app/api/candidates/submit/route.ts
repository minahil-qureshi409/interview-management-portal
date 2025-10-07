// src/app/api/candidate/submit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CandidateInput } from "@/types/candidate";

export async function POST(req: Request) {
  try {
    const data: CandidateInput = await req.json();

    const candidate = await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        title: data.title,
        company: data.company,
        moreInfo: data.moreInfo,

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
    return NextResponse.json({ error: "Failed to save candidate" }, { status: 500 });
  }
}
