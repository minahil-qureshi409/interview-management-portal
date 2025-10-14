// app/api/resume/parse/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import PDFParser from "pdf2json"; // This import is correct with the declarations file

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to parse PDFs using pdf2json
const parsePdf = (fileBuffer: Buffer): Promise<{ text: string, hasImages: boolean }> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      const rawText = pdfParser.getRawTextContent();
      console.log("\n--- Raw Text Extracted ---\n", rawText, "\n--- End of Raw Text ---\n");
      // If text is minimal, we assume it's a scanned document that needs vision processing
      resolve({ text: rawText, hasImages: rawText.trim().length < 100 });
    });
    pdfParser.parseBuffer(fileBuffer);
  });
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    if (!resumeFile) return NextResponse.json({ error: 'No resume file provided.' }, { status: 400 });

    const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
    let resumeContent: string = '';
    let isImage = false;
    let imageMimeType = resumeFile.type;

    if (resumeFile.type === 'application/pdf') {
      const { text, hasImages } = await parsePdf(fileBuffer);

      if (!hasImages) {
        console.log("[API] PDF contains text. Using text-based parsing.");
        isImage = false;
        resumeContent = text;
      } else {
        console.warn("[API] PDF has minimal text. Treating as a scanned image for gpt-4o.");
        isImage = true;
        resumeContent = fileBuffer.toString('base64');
        imageMimeType = 'image/jpeg'; // Fallback MIME type for OpenAI vision
      }

    } else if (resumeFile.type.startsWith('image/')) { // <-- THIS IS THE CORRECTED LINE
      console.log("[API] File is an image. Using image-based parsing.");
      isImage = true;
      resumeContent = fileBuffer.toString('base64');
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    if (!resumeContent) throw new Error("Failed to extract content from the file.");

   const prompt = `
      You are an expert AI assistant specializing in resume parsing for an HR system.
      Your task is to analyze the provided resume content (text or image) and extract key information into a single, perfectly structured JSON object.

      **CRITICAL INSTRUCTIONS:**
      1.  Your entire output MUST be a single, valid JSON object. Do not include any extra text, explanations, or markdown like \`\`\`json.
      2.  Strictly adhere to the JSON structure and field names provided below.
      3.  If a piece of information is not found, omit the field or use an empty string/array. Do not invent data.
      4.  Make logical inferences based on common resume formats.

      **JSON STRUCTURE AND FIELD-SPECIFIC RULES:**

      {
        "firstName": "string (Candidate's first name only)",
        "lastName": "string (Candidate's last name only)",
        "email": "string (Candidate's primary email address)",
        "phone": "string (Candidate's primary phone number)",
        "title": "string (Candidate's most recent or prominent job title, e.g., 'Senior Software Engineer')",
        
        "skills": ["string", "string (A list of key technical and soft skills mentioned)"],

        "education": [
          { 
            "institution": "string (Name of the university, college, or school)", 
            "degree": "string (The full degree name, e.g., 'Bachelor of Science in Computer Science')", 
            "year": "string (The graduation year or final year of attendance. Extract only the year, e.g., '2022')"
          }
        ],

        "workExperience": [
          { 
            "companyName": "string (Name of the company)", 
            "title": "string (Job title held at this company)", 
            
            // --- DATE EXTRACTION RULES ---
            "dates": "string (The raw employment period. IMPORTANT: If possible, format start and end dates as MM/YYYY. Example: '01/2020 - 12/2022' or '03/2023 - Present')",
            
            "responsibilities": "string (A concise summary of key responsibilities and achievements in this role)"
          }
        ],
        
        "languageSkills": [
          { 
            "language": "string (e.g., 'English')",
            
            // --- LANGUAGE PROFICIENCY RULES ---
            // If a single proficiency is listed (e.g., "English: Fluent"), apply it to all three fields below.
            "speaking": "string (Proficiency level like 'Fluent', 'Native', 'Basic')",
            "reading": "string (Proficiency level)",
            "writing": "string (Proficiency level)"
          }
        ]
      }
    `;

    const modelToUse = isImage ? 'gpt-4o' : 'gpt-3.5-turbo-0125';

    const messages: any[] = [{ role: 'system', content: prompt }, {
      role: 'user',
      content: isImage
        ? [{ type: 'text', text: 'Extract info from this resume image.' }, { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${resumeContent}` } }]
        : resumeContent
    }];

    console.log(`[API] Parsing resume with model: ${modelToUse}`);
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      response_format: { type: "json_object" },
      messages,
    });

    const extractedJson = completion.choices[0].message.content;
    if (!extractedJson) throw new Error("OpenAI returned an empty response.");

    const extractedData = JSON.parse(extractedJson);
    return NextResponse.json(extractedData, { status: 200 });

  } catch (error) {
    console.error("Error parsing resume:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: 'Failed to parse resume.', details: errorMessage }, { status: 500 });
  }
}