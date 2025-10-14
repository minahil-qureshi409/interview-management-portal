// app/api/resume/parse/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import path from 'path';
import { promises as fs } from 'fs';

// --- THIS IS THE FIX for 'is not a constructor' ---
// The library uses a default export, not a named export.
import Poppler from 'pdf-poppler'; 
import sharp from 'sharp';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      const pdfParseModule: any = await import('pdf-parse');
      const PDFParser = pdfParseModule.PDFParse || pdfParseModule.default || pdfParseModule;
      const pdfData = await new PDFParser(fileBuffer);
      resumeContent = pdfData.text;

      if (!resumeContent || resumeContent.trim().length < 100) {
        console.log("[API] PDF contains no text. Converting all pages to a single image for vision analysis.");
        isImage = true;
        
        // This line will now work because the import is correct
        const poppler = new Poppler(); 
        const info = await poppler.pdfInfo(fileBuffer);
        const numPages = info.pages;
        const pageImageBuffers: Buffer[] = [];

        for (let i = 1; i <= numPages; i++) {
          const options = { firstPageToConvert: i, lastPageToConvert: i, pngFile: true };
          pageImageBuffers.push(await poppler.pdfToCairo(fileBuffer, options));
        }

        if (pageImageBuffers.length === 0) throw new Error("Could not convert PDF pages to images.");

        const imageMetadata = await Promise.all(pageImageBuffers.map(b => sharp(b).metadata()));
        const totalHeight = imageMetadata.reduce((sum, meta) => sum + (meta.height || 0), 0);
        const maxWidth = Math.max(...imageMetadata.map(meta => meta.width || 0));

        const finalImageBuffer = await sharp({
            create: { width: maxWidth, height: totalHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
        }).composite(pageImageBuffers.map((buffer, index) => ({
            input: buffer,
            top: imageMetadata.slice(0, index).reduce((sum, meta) => sum + (meta.height || 0), 0),
            left: 0
        }))).png().toBuffer();

        resumeContent = finalImageBuffer.toString('base64');
        imageMimeType = 'image/png';
      }
      
    } else if (resumeFile.type.startsWith('image/')) {
      isImage = true;
      resumeContent = fileBuffer.toString('base64');
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    if (!resumeContent) throw new Error("Failed to extract content.");
    
    const prompt = `You are an expert HR assistant... (your prompt here)`;
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