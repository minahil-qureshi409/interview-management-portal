"use client";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { createWorker } from "tesseract.js";

// ✅ Define the structure of your extracted data
export interface ExtractedData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  education?: { degree: string; institution?: string; year?: string }[];
  workExperience?: { companyName: string; title: string; responsibilities?: string; dates?: string }[];
  languageSkills?: { language: string; speaking?: string; reading?: string; writing?: string }[];
  skills?: string[]; // Added for skills list
  [key: string]: unknown; // fallback for any extra data
}

interface ResumeUploadModalProps {
  onDataExtracted: (data: ExtractedData) => void;
  onClose: () => void;
}

export default function ResumeUploadModal({
  onDataExtracted,
  onClose,
}: ResumeUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const workerRef = useRef<Tesseract.Worker | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const initializeWorker = async () => {
      try {
        const worker = await createWorker("eng", 1, {
          logger: (m) => {
            // console.log("OCR Progress:", m); // Keep this for detailed debugging if needed
            if (m.status === 'recognizing text' || m.status === 'loading tesseract core' || m.status === 'loading language traineddata') {
              const statusMap: { [key: string]: number } = {
                'loading tesseract core': 0.1,
                'initializing api': 0.2,
                'loading language traineddata': 0.4,
                'initializing api completed': 0.5,
                'recognizing text': m.progress ? 0.5 + m.progress * 0.5 : 0.5
              };
              setProgress(Math.round((statusMap[m.status] || 0) * 100));
            }
          },
        });
        workerRef.current = worker;
        setWorkerReady(true);
        console.log("Tesseract.js worker initialized.");
      } catch (err) {
        console.error("Failed to initialize Tesseract worker:", err);
        alert("Failed to load OCR engine. Please try refreshing.");
        onClose();
      }
    };

    initializeWorker();

    return () => {
      document.body.style.overflow = "auto";
      if (workerRef.current) {
        console.log("Terminating Tesseract.js worker.");
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [onClose]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // 🔥 REFACTORED AND IMPROVED PARSING FUNCTION
  const parseResumeText = (text: string): ExtractedData => {
    console.log("--- Starting Resume Parsing ---");
    console.log("Raw OCR Text:\n", text);

    const extractedData: ExtractedData = {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      education: [],
      workExperience: [],
      languageSkills: [],
      skills: []
    };

    const rawLines = text.split('\n');
    const lines = rawLines
      .map(line => line.trim())
      .filter(line => line.length > 0);
    const cleanText = text.replace(/\s+/g, ' ').trim(); // Used for global searches

    // --- 1. Initial Pass for Contact Information (very top of resume) ---
    for (let i = 0; i < Math.min(lines.length, 7); i++) {
      const line = lines[i];

      // Email
      if (!extractedData.email) {
        const emailMatch = line.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
        if (emailMatch) {
          extractedData.email = emailMatch[1];
          console.log("Extracted Email:", extractedData.email);
        }
      }

      // Phone (more robust regex for various formats, tolerating some OCR noise like %)
      if (!extractedData.phone) {
        const phoneMatch = line.match(/(?:\+\d{1,4}[-.\s]?)?(?:KATEX_INLINE_OPEN?\d{2,}KATEX_INLINE_CLOSE?[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}(?:\s*(?:ext|x)\s*\d+)?|\b(?:\d[\s.-]*){7,15}\b/);
        if (phoneMatch) {
          // Clean up the phone number by removing non-digits, except for a leading '+'
          extractedData.phone = phoneMatch[0].replace(/[^\d+]/g, '');
          console.log("Extracted Phone:", extractedData.phone);
        }
      }

      // Name (very conservative: only if it looks like a full name, is capitalized, and not a job title)
      if (!extractedData.firstName && !extractedData.email && !extractedData.phone) {
        const nameMatch = line.match(/^([A-Z][a-zA-Z'-]+\s+[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)?(?:\s+(?:Jr\.|Sr\.|III|IV))?)$/);
        if (nameMatch) {
          const fullName = nameMatch[1].trim();
          const lowerFullName = fullName.toLowerCase();
          const jobTitleKeywords = ['designer', 'developer', 'engineer', 'manager', 'specialist', 'architect', 'analyst', 'consultant', 'lead', 'director', 'senior', 'junior', 'profile'];
          if (!jobTitleKeywords.some(keyword => lowerFullName.includes(keyword)) && nameMatch[0].split(/\s+/).length >= 2) {
            const nameParts = fullName.split(/\s+/);
            extractedData.firstName = nameParts[0];
            extractedData.lastName = nameParts[nameParts.length - 1];
            console.log("Extracted Name:", extractedData.firstName, extractedData.lastName);
          }
        }
      }
    }


    // --- 2. Robust Section-Based Parsing ---
    const sections: { [key: string]: string[] } = {};
    const sectionHeaders: { [key: string]: string[] } = {
      'WORK_EXPERIENCE': ['work experience', 'experience', 'professional experience', 'employment history'],
      'EDUCATION': ['education', 'academic history', 'qualifications', 'degrees'],
      'SKILLS': ['skills', 'technical skills', 'core competencies', 'abilities', 'expertise', 'digital marketing', 'branding', 'copywriting'],
      'LANGUAGE_SKILLS': ['languages', 'language skills', 'linguistic abilities'],
      'REFERENCES': ['references'] // Will be ignored for data extraction, but helps sectioning
    };

    const getSectionKey = (line: string) => {
      const lowerLine = line.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      for (const key in sectionHeaders) {
        if (sectionHeaders[key].some(keyword => lowerLine.includes(keyword) || lowerLine.startsWith(keyword))) {
          return key;
        }
      }
      return null;
    };

    let currentSection: string | null = null;
    let sectionContentStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const potentialSectionKey = getSectionKey(line);

      // If we detect a new section header
      if (potentialSectionKey) {
        // First, save content of the previous section
        if (currentSection && i > sectionContentStartIndex) {
          sections[currentSection] = sections[currentSection] || [];
          sections[currentSection].push(...lines.slice(sectionContentStartIndex, i));
          console.log(`Saved content for section "${currentSection}": ${sections[currentSection].length} lines.`);
        }
        currentSection = potentialSectionKey;
        sectionContentStartIndex = i + 1; // Start collecting for new section from the next line
        console.log(`Switched to new section: ${currentSection}`);
      }
    }

    // Save content for the very last section
    if (currentSection && lines.length > sectionContentStartIndex) {
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push(...lines.slice(sectionContentStartIndex, lines.length));
      console.log(`Saved final content for section "${currentSection}": ${sections[currentSection].length} lines.`);
    }

    // --- Parse WORK_EXPERIENCE (Enhanced for better Company/Title/Dates detection) ---
    if (sections['WORK_EXPERIENCE'] && sections['WORK_EXPERIENCE'].length > 0) {
      console.log("Parsing Work Experience section content:", sections['WORK_EXPERIENCE']);
      let currentJob: { companyName: string; title: string; responsibilities: string[]; dates?: string } | null = null;

      // More flexible date regex, tolerating month typos and single years
      const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|J?an|F?eb|M?ar|A?pr|M?ay|J?un|J?ul|A?ug|S?ep|O?ct|N?ov|D?ec)\.?\s*(?:\d{4})\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|D?ec)\.?\s*)?(?:\d{3}[0-9sS]|Present)\b|\b(?:\d{4})\s*[-–—]\s*(?:\d{3}[0-9sS]|Present|\s*current|\s*now)\b|\b\d{4}(?:\s*\|\s*|\s*,\s*|)\s*[A-Z][a-zA-Z\s,.'&-]+(?:Co\.|Company|Inc\.|LLC|Ltd\.)?/i;

      for (let i = 0; i < sections['WORK_EXPERIENCE'].length; i++) {
        const line = sections['WORK_EXPERIENCE'][i].trim();
        if (line.length === 0) continue;

        const isBulletPoint = /^[•*+\-—]\s*/.test(line); // Common bullet points
        const containsDate = line.match(dateRegex);
        const looksLikeCompanyOrTitle = /^[A-Z][a-zA-Z\s,.'&-]+(?:\s+(?:Co\.|Company|Inc\.|LLC|Ltd\.|Group|University))?$/.test(line) && line.length > 3 && line.length < 70;

        // Heuristics for new job entry:
        // 1. Line contains a date range (strongest signal)
        // 2. Line looks like a capitalized company or title, and current job is not yet defined or very old.
        // 3. Line is not a bullet point.

        const isNewJobStart = containsDate || (looksLikeCompanyOrTitle && (!currentJob || currentJob.responsibilities.length === 0));

        if (isNewJobStart && !isBulletPoint) {
          if (currentJob && (currentJob.companyName || currentJob.title || currentJob.responsibilities.length > 0)) {
            currentJob.responsibilities = currentJob.responsibilities.filter(r => r.trim().length > 1 && !/^\s*[-•*+—]\s*$/.test(r));
            extractedData.workExperience?.push({
              companyName: currentJob.companyName || "Unknown Company",
              title: currentJob.title || "Unknown Title",
              responsibilities: currentJob.responsibilities.join('\n').trim(),
              dates: currentJob.dates
            });
          }
          currentJob = { companyName: "", title: "", responsibilities: [], dates: undefined };

          if (containsDate) {
            currentJob.dates = containsDate[0].trim();
            const remaining = line.replace(containsDate[0], '').trim();
            // Try to deduce company/title from remaining part or surrounding lines
            currentJob.companyName = remaining.match(/^[A-Z][a-zA-Z\s,.'&-]+(?:Co\.|Company|Inc\.|LLC|Ltd\.)?/)?.[0] || "";
            currentJob.title = remaining.replace(currentJob.companyName, '').trim();

            if (!currentJob.companyName && i > 0) { // Look at previous line for company
                const prevLine = sections['WORK_EXPERIENCE'][i - 1].trim();
                if (looksLikeCompanyOrTitle && !getSectionKey(prevLine)) { // Avoid pulling from another section header
                    currentJob.companyName = prevLine;
                }
            }
            if (!currentJob.title && i + 1 < sections['WORK_EXPERIENCE'].length) { // Look at next line for title
                const nextLine = sections['WORK_EXPERIENCE'][i + 1].trim();
                if (looksLikeCompanyOrTitle && !getSectionKey(nextLine) && !/^\d{4}/.test(nextLine)) {
                    currentJob.title = nextLine;
                    i++; // Consume this line as title
                }
            }
          } else { // It's a company/title line without clear dates
            currentJob.companyName = line;
            if (i + 1 < sections['WORK_EXPERIENCE'].length) {
                const nextLine = sections['WORK_EXPERIENCE'][i + 1].trim();
                if (looksLikeCompanyOrTitle && !getSectionKey(nextLine) && !/^\d{4}/.test(nextLine)) {
                    currentJob.title = nextLine;
                    i++; // Consume this line as title
                } else if (nextLine.match(dateRegex)) { // Next line is dates
                    currentJob.dates = nextLine.match(dateRegex)?.[0];
                    i++; // Consume this line as dates
                }
            }
          }
          console.log(`Detected Job: Company:"${currentJob.companyName}", Title:"${currentJob.title}", Dates:"${currentJob.dates}"`);
        } else if (currentJob) {
          // If it's a bullet point or looks like a responsibility
          currentJob.responsibilities.push(line);
        }
      }

      // Push the last job entry after the loop
      if (currentJob && (currentJob.companyName || currentJob.title || currentJob.responsibilities.length > 0)) {
        currentJob.responsibilities = currentJob.responsibilities.filter(r => r.trim().length > 1 && !/^\s*[-•*+—]\s*$/.test(r));
        extractedData.workExperience?.push({
          companyName: currentJob.companyName || "Unknown Company",
          title: currentJob.title || "Unknown Title",
          responsibilities: currentJob.responsibilities.join('\n').trim(),
          dates: currentJob.dates
        });
      }
      console.log("Extracted Work Experience:", extractedData.workExperience);
    }

    // --- Parse EDUCATION ---
    if (sections['EDUCATION'] && sections['EDUCATION'].length > 0) {
      console.log("Parsing Education section content:", sections['EDUCATION']);
      let currentEdu: { degree: string; institution?: string; year?: string } | null = null;

      const degreePattern = /(bachelor|master|phd|ph\.d|mba|bs|ba|ms|ma|associate|a\.s|as|a\.a|aa|diploma|certificate)[^.\n]*(?:in|of)?\s*([^,\n]*)/i;
      const institutionPattern = /([A-Z][a-zA-Z\s,.'&-]+(?:University|College|Institute|School|Academy|Polytechnic|Tech(?:nical)?))\b/i;
      const yearPattern = /\b(?:graduated|expected)?\s*((?:19|20)\d{2})\b/i;

      for (const line of sections['EDUCATION']) {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) continue;

        const degreeMatch = trimmedLine.match(degreePattern);
        const institutionMatch = trimmedLine.match(institutionPattern);
        const yearMatch = trimmedLine.match(yearPattern);

        // A new education entry is likely identified by a degree or institution
        if (degreeMatch || institutionMatch) {
          if (currentEdu) {
            // Push previous education if it's sufficiently populated
            if (currentEdu.degree !== "Degree" || currentEdu.institution) {
              extractedData.education?.push(currentEdu);
            }
          }
          currentEdu = {
            degree: degreeMatch ? degreeMatch[0].trim().replace(/\s*\|\s*Product Design Manager/i, '') : "Degree", // Clean up "Product Design Manager" if it got in
            institution: institutionMatch ? institutionMatch[0].trim() : undefined,
            year: yearMatch ? yearMatch[1].trim() : undefined
          };
        } else if (currentEdu) {
          // Try to fill in missing info for the current entry
          if (!currentEdu.institution) {
            const instMatch = trimmedLine.match(institutionPattern);
            if (instMatch) currentEdu.institution = instMatch[0].trim();
          }
          if (!currentEdu.year) {
            const yrMatch = trimmedLine.match(yearPattern);
            if (yrMatch) currentEdu.year = yrMatch[1].trim();
          }
          if (currentEdu.degree === "Degree" && trimmedLine.match(degreePattern)) {
             currentEdu.degree = trimmedLine.match(degreePattern)?.[0]?.trim()?.replace(/\s*\|\s*Product Design Manager/i, '') || currentEdu.degree;
          }
        }
      }
      if (currentEdu && (currentEdu.degree !== "Degree" || currentEdu.institution)) {
        extractedData.education?.push(currentEdu);
      }
      console.log("Extracted Education:", extractedData.education);
    }

    // --- Parse SKILLS ---
    if (sections['SKILLS'] && sections['SKILLS'].length > 0) {
      console.log("Parsing Skills section content:", sections['SKILLS']);
      const skillsText = sections['SKILLS'].join(' ');
      const skills = skillsText
        .split(/[,•;+\-]\s*|[\n\r\t]/) // Split by commas, bullets, semicolons, hyphens, newlines
        .map(skill => skill.trim())
        .filter(skill => skill.length > 2 && skill.length < 50 && !/\d/.test(skill) && !/^(?:and|or|the|a|an|to|of|in|on|with|for)$/i.test(skill)) // More filtering
        .slice(0, 20); // Limit number of skills
      extractedData.skills = skills;
      console.log("Extracted Skills:", extractedData.skills);
    }

    // --- Parse LANGUAGE_SKILLS ---
    if (sections['LANGUAGE_SKILLS'] && sections['LANGUAGE_SKILLS'].length > 0) {
      console.log("Parsing Language Skills section content:", sections['LANGUAGE_SKILLS']);
      for (const line of sections['LANGUAGE_SKILLS']) {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) continue;

        // Pattern: "Language (Proficiency)" or "Language - Proficiency" or just "Language"
        const langProficiencyMatch = trimmedLine.match(/^([A-Za-z\s]+?)\s*(?:[-–—(]\s*(native|fluent|proficient|intermediate|basic|conversational|beginner)\s*[)])?/i);
        if (langProficiencyMatch) {
          extractedData.languageSkills?.push({
            language: langProficiencyMatch[1].trim(),
            speaking: langProficiencyMatch[2] ? langProficiencyMatch[2].toLowerCase() : undefined,
            reading: undefined,
            writing: undefined,
          });
        } else {
          // Fallback for simple lists:
          const parts = trimmedLine.split(/[,;]\s*|\s*•\s*/).map(p => p.trim()).filter(p => p.length > 2);
          parts.forEach(part => {
            if (part) extractedData.languageSkills?.push({ language: part, speaking: undefined, reading: undefined, writing: undefined });
          });
        }
      }
      console.log("Extracted Language Skills:", extractedData.languageSkills);
    }

    // --- Final Cleanup / Post-processing (Optional) ---
    // Ensure arrays are not empty if no data was truly found, set to undefined
    if (extractedData.education && extractedData.education.length === 0) delete extractedData.education;
    if (extractedData.workExperience && extractedData.workExperience.length === 0) delete extractedData.workExperience;
    if (extractedData.languageSkills && extractedData.languageSkills.length === 0) delete extractedData.languageSkills;
    if (extractedData.skills && extractedData.skills.length === 0) delete extractedData.skills;

    console.log("--- Finished Resume Parsing ---");
    console.log("Final Extracted Data:", JSON.stringify(extractedData, null, 2));
    return extractedData;
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a resume first.");
    if (!workerRef.current || !workerReady) return alert("OCR engine not ready. Please wait.");

    setLoading(true);
    setProgress(0);

    try {
      const { data: { text } } = await workerRef.current.recognize(file);
      const extractedData = parseResumeText(text);

      if (
        !extractedData.firstName && !extractedData.lastName && !extractedData.email && !extractedData.phone &&
        (!extractedData.workExperience || extractedData.workExperience.length === 0) &&
        (!extractedData.education || extractedData.education.length === 0) &&
        (!extractedData.languageSkills || extractedData.languageSkills.length === 0) &&
        (!extractedData.skills || extractedData.skills.length === 0)
      ) {
        alert("No significant data could be extracted. Please ensure the file is a clear image of a resume.");
        onDataExtracted({}); // Provide an empty object to clear form
      } else {
        onDataExtracted(extractedData);
      }
      onClose();
    } catch (error) {
      console.error("❌ OCR failed:", error);
      alert("Failed to extract text from resume. Please try again. Ensure the file is a clear image (JPG/PNG).");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const isUploadDisabled = loading || !workerReady;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-6 text-center">Upload Resume (Client-Side OCR)</h2>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm">
          <p className="text-blue-700">
            <strong>Tips for better results:</strong>
            <br />• Use clear, high-resolution images
            <br />• Ensure good lighting and contrast
            <br />• Avoid complex layouts or multiple columns
            <br />• This is client-side OCR, results may vary.
          </p>
        </div>

        {!workerReady && (
          <p className="text-center text-gray-600 mb-4">
            Loading OCR engine... Please wait. This may take a moment.
          </p>
        )}

        <div className="flex justify-between items-center mb-4">
          <label
            htmlFor="file-upload"
            className="border p-2 rounded-md w-full flex items-center justify-between cursor-pointer hover:bg-gray-50"
          >
            <span className="text-sm text-gray-500 truncate">
              {file ? file.name : "Choose Image File (JPG, PNG)"}
            </span>
            <input
              id="file-upload"
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading || !workerReady}
            />
          </label>
        </div>

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-sm text-center text-gray-600 mt-1">{`Processing... ${progress}%`}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={isUploadDisabled}
            className={`${isUploadDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-[#19183B] hover:bg-[#161950d4]"
              } text-white px-6 py-3 rounded-md shadow-md w-full transition-colors`}
          >
            {loading ? "Extracting..." : !workerReady ? "Initializing OCR..." : "Upload & Extract"}
          </button>
        </div>
      </div>
    </div>
  );
}