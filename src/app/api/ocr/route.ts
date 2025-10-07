// import { NextResponse } from "next/server";
// import Tesseract from "tesseract.js";

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("resume") as File;

//     if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

//     const buffer = Buffer.from(await file.arrayBuffer()); // convert file to Buffer

//     // Use Tesseract with buffer
//     const result = await Tesseract.recognize(buffer, "eng", {
//       logger: (m) => console.log("OCR:", m),
//     });

//     const text = result.data.text;

//     // Example extraction
//     const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || "";
//     const phone = text.match(/\+?\d[\d\s-]{7,}\d/)?.[0] || "";

//     return NextResponse.json({ text, email, phone });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "OCR failed" }, { status: 500 });
//   }
// }
