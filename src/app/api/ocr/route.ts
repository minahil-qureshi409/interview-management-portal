// src/app/api/ocr/route.ts
import { NextResponse } from "next/server";
// import Tesseract from 'tesseract.js'; // or your OCR library

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    // Here you would process the file with OCR
    // Mocked extracted data for now
    const extractedData = {
      personalInfo: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+123456789",
      },
      education: [
        { degree: "BSc Computer Science", institution: "ABC University", year: "2020" },
      ],
      workExperience: [
        { company: "XYZ Corp", role: "Software Engineer", duration: "2020-2023" },
      ],
      languages: ["English", "Spanish"],
      documents: [],
      moreInfo: "",
    };

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
