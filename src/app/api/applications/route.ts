import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // --- Input validation ---
    if (!data.jobId || !data.name || !data.email) {
      return NextResponse.json(
        { error: "Missing required fields: jobId, name, or email" },
        { status: 400 }
      );
    }

    const jobIdNumber = Number(data.jobId);
    if (isNaN(jobIdNumber)) {
      return NextResponse.json({ error: "jobId must be a number" }, { status: 400 });
    }

    // --- Create new application ---
    const newApplication = await prisma.application.create({
      data: {
        jobId: jobIdNumber,
        name: data.name,
        email: data.email,
        resumeUrl: data.resumeUrl || null,
        skills: data.skills || null,
        experience: data.experience || null,
      },
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (err) {
    console.error("Error saving application:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
