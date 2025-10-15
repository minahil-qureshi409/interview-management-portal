// app/api/candidates/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { promises as fs } from 'fs';
import { Prisma } from '@prisma/client'; // <-- We only need to import the main namespace
import { getAuthSession } from '@/lib/auth';


// HELPER FUNCTION to generate a unique ID for the candidate
const generateCandidateId = async () => {
    const count = await prisma.candidate.count();
    const year = new Date().getFullYear();
    const paddedCount = (count + 1).toString().padStart(5, '0');
    return `C-${year}-${paddedCount}`;
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  // Security check: only authenticated users can submit
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized: You must be logged in to submit an application.' }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const jsonDataString = formData.get('jsonData') as string | null;

    if (!jsonDataString) {
      return NextResponse.json({ error: 'Missing form data' }, { status: 400 });
    }
    const data = JSON.parse(jsonDataString);

    const documentFiles = formData.getAll('documents') as File[];
    const uploadDir = path.join(process.cwd(), "/public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const documentsToCreate = await Promise.all(
      documentFiles.map(async (file) => {
        const uniqueFilename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        return {
          fileName: file.name,
          fileUrl: `/uploads/${uniqueFilename}`,
          fileType: file.type,
        };
      })
    );

    const candidateId = await generateCandidateId();
    const candidateData = {
       user: {
        connect: {
          id: session.user.id, // Connect to the logged-in user's ID
        },
      },
      candidateId,
      skills: data.skills || [],
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      // email: data.email,
      phone: data.phone,
      title: data.title,
      company: data.company,
      moreInfo: data.moreInfo,
      workExperience: { create: data.workExperience?.map((w: any) => ({
          companyName: w.companyName,
          title: w.title,
          currentlyWorking: w.currentlyWorking === 'Yes',
          fromDate: new Date(w.fromDate),
          endDate: w.endDate ? new Date(w.endDate) : undefined,
          country: w.country,
          responsibilities: w.responsibilities,
        }))},
      education: { create: data.education?.map((e: any) => ({
          institute: e.institute,
          specifyOther: e.specifyOther,
          degree: e.degree,
          major: e.major,
          fromDate: e.fromDate ? new Date(e.fromDate) : undefined,
          endDate: e.endDate ? new Date(e.endDate) : undefined,
          country: e.country,
        }))},
      languageSkills: { create: data.languageSkills },
      travelMobility: { create: data.travelMobility },
      documents: { create: documentsToCreate },
    };

    const candidate = await prisma.candidate.create({ data: candidateData });
    return NextResponse.json({ message: "Candidate saved successfully", candidate }, { status: 201 });

  } catch (error) {
    console.error("[API] A fatal error occurred:", error);
    
    // --- THIS IS THE FINAL, CORRECT SYNTAX ---
    // The error class is a property of the main 'Prisma' namespace.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: "A candidate with this email already exists." }, { status: 409 });
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "Failed to save candidate", details: errorMessage }, { status: 500 });
  }
}