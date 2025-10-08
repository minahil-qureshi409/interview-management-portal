"use client";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { createWorker } from "tesseract.js";

//structure of your extracted data
export interface ExtractedData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  education?: { degree: string; institution?: string; year?: string }[];
  workExperience?: { companyName: string; title: string; responsibilities?: string; dates?: string }[];
  languageSkills?: { language: string; speaking?: string; reading?: string; writing?: string }[];
  skills?: string[]; 
  [key: string]: unknown; 
}

interface ResumeUploadModalProps {
  onDataExtracted: (data: ExtractedData, file: File) => void;
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

  // PARSING FUNCTION 
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

  // Split into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // --- EXTRACT EMAIL ---
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  for (const line of lines) {
    const match = line.match(emailPattern);
    if (match) {
      extractedData.email = match[0];
      console.log("✅ Found email:", extractedData.email);
      break;
    }
  }

  // --- EXTRACT PHONE ---
  // Look for patterns like "123-456-7890" or similar
  const phonePatterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    /\b\d{10}\b/,
    /123[-.\s]?456[-.\s]?78[0-9%]{1,2}0/ 
  ];
  
  for (const line of lines) {
    for (const pattern of phonePatterns) {
      const match = line.match(pattern);
      if (match) {
        extractedData.phone = match[0].replace(/[^\d]/g, '');
        console.log("✅ Found phone:", extractedData.phone);
        break;
      }
    }
    if (extractedData.phone) break;
  }

  // --- EXTRACT NAME ---
  // Look for name at the beginning, avoiding job titles
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines with numbers, special characters, or job titles
    if (/\d{2,}/.test(line) || line.includes('@') || line.includes('|')) continue;
    
    // Check if it's a potential name (not "Graphics Designer" which is a job title)
    const titleWords = ['Designer', 'Developer', 'Manager', 'Engineer', 'Analyst', 'profile'];
    const hasTitle = titleWords.some(word => line.includes(word));
    
    if (!hasTitle && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(line)) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        extractedData.firstName = parts[0];
        extractedData.lastName = parts[parts.length - 1];
        console.log("✅ Found name:", extractedData.firstName, extractedData.lastName);
        break;
      }
    }
  }

  // --- IDENTIFY SECTIONS ---
  const sections: { [key: string]: { startIdx: number; endIdx: number } } = {};
  const sectionLines: { [key: string]: string[] } = {};
  
  // Find section headers and their positions
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    
    if (lower.includes('work experience') || lower === 'experience') {
      sections.experience = { startIdx: idx + 1, endIdx: lines.length };
    } else if (lower.includes('education')) {
      sections.education = { startIdx: idx + 1, endIdx: lines.length };
      // Update end of previous section
      if (sections.experience) {
        sections.experience.endIdx = idx;
      }
    } else if (lower.includes('skill') && !lower.includes('language')) {
      sections.skills = { startIdx: idx + 1, endIdx: lines.length };
      // Update end of previous sections
      Object.keys(sections).forEach(key => {
        if (key !== 'skills' && sections[key].endIdx > idx) {
          sections[key].endIdx = idx;
        }
      });
    } else if (lower.includes('language')) {
      sections.languages = { startIdx: idx + 1, endIdx: lines.length };
      // Update end of previous sections
      Object.keys(sections).forEach(key => {
        if (key !== 'languages' && sections[key].endIdx > idx) {
          sections[key].endIdx = idx;
        }
      });
    }
  });

  // Extract lines for each section
  Object.keys(sections).forEach(key => {
    sectionLines[key] = lines.slice(sections[key].startIdx, sections[key].endIdx);
    console.log(`📌 ${key} section: ${sectionLines[key].length} lines`);
  });

  // --- PARSE WORK EXPERIENCE ---
  if (sectionLines.experience && sectionLines.experience.length > 0) {
    let currentJob: any = null;
    const jobs: any[] = [];
    
    for (let i = 0; i < sectionLines.experience.length; i++) {
      const line = sectionLines.experience[i];
      
      // Pattern: "2020 | Company Name" or similar
      const yearCompanyMatch = line.match(/^(\d{4})\s*[|]\s*(.+)$/);
      const dateRangeMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4})/);
      
      if (yearCompanyMatch) {
        // Save previous job if exists
        if (currentJob && currentJob.companyName) {
          jobs.push(currentJob);
        }
        
        // Start new job
        currentJob = {
          companyName: yearCompanyMatch[2].trim(),
          title: '',
          responsibilities: [],
          dates: yearCompanyMatch[1]
        };
        
        // Look for title in next line
        if (i + 1 < sectionLines.experience.length) {
          const nextLine = sectionLines.experience[i + 1];
          // If next line doesn't contain special characters or dates, it's likely a title
          if (!/[|•*+\-]/.test(nextLine) && !/\d{4}/.test(nextLine) && nextLine.length < 50) {
            currentJob.title = nextLine;
            i++; // Skip next line
          }
        }
      } else if (dateRangeMatch) {
        // Handle date range format "2006 - 2008"
        if (currentJob && currentJob.companyName) {
          jobs.push(currentJob);
        }
        
        currentJob = {
          companyName: line.replace(dateRangeMatch[0], '').trim(),
          title: '',
          responsibilities: [],
          dates: dateRangeMatch[0]
        };
      } else if (currentJob) {
        // Check if it's a responsibility (bullet point or similar)
        if (/^[•*+\-]/.test(line) || line.startsWith('Manage') || line.startsWith('Work')) {
          const responsibility = line.replace(/^[•*+\-]\s*/, '');
          currentJob.responsibilities.push(responsibility);
        } else if (!currentJob.title && line.length < 50 && !/^\d/.test(line)) {
          // Might be a job title
          currentJob.title = line;
        } else {
          // Add as responsibility
          currentJob.responsibilities.push(line);
        }
      }
    }
    
    // Don't forget the last job
    if (currentJob && currentJob.companyName) {
      jobs.push(currentJob);
    }
    
    // Add all jobs to extractedData
    jobs.forEach(job => {
      if (job.companyName || job.title) {
        extractedData.workExperience?.push({
          companyName: job.companyName || "Company",
          title: job.title || "Position",
          responsibilities: job.responsibilities.join('\n'),
          dates: job.dates || ""
        });
      }
    });
    
    console.log("✅ Extracted work experience:", extractedData.workExperience?.length, "jobs");
  }

  // --- PARSE EDUCATION ---
  if (sectionLines.education && sectionLines.education.length > 0) {
    let currentEdu: any = null;
    const eduEntries: any[] = [];
    
    for (const line of sectionLines.education) {
      const lower = line.toLowerCase();
      
      // Skip if line contains job titles (common OCR error mixing sections)
      if (lower.includes('design manager') || lower.includes('product manager')) {
        continue;
      }
      
      // Check for degree keywords
      const hasDegree = /bachelor|master|phd|diploma|degree|mba/i.test(line);
      const hasUniversity = /university|college|institute|school/i.test(line);
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      
      if (hasDegree) {
        // Save previous education if exists
        if (currentEdu && (currentEdu.degree || currentEdu.institution)) {
          eduEntries.push(currentEdu);
        }
        
        // Start new education entry
        currentEdu = {
          degree: line.replace(/\b(19|20)\d{2}\b/, '').replace(/[|].*$/, '').trim(),
          institution: '',
          year: yearMatch ? yearMatch[0] : ''
        };
      } else if (hasUniversity) {
        if (currentEdu) {
          currentEdu.institution = line.replace(/\b(19|20)\d{2}\b/, '').trim();
          if (yearMatch && !currentEdu.year) {
            currentEdu.year = yearMatch[0];
          }
        } else {
          currentEdu = {
            degree: '',
            institution: line.replace(/\b(19|20)\d{2}\b/, '').trim(),
            year: yearMatch ? yearMatch[0] : ''
          };
        }
      } else if (currentEdu && yearMatch && !currentEdu.year) {
        currentEdu.year = yearMatch[0];
      }
    }
    
    // Don't forget the last education entry
    if (currentEdu && (currentEdu.degree || currentEdu.institution)) {
      eduEntries.push(currentEdu);
    }
    
    // Add all education entries
    eduEntries.forEach(edu => {
      if (edu.degree || edu.institution) {
        extractedData.education?.push({
          degree: edu.degree || "Degree",
          institution: edu.institution || "",
          year: edu.year || ""
        });
      }
    });
    
    console.log("✅ Extracted education:", extractedData.education?.length, "entries");
  }

  // --- PARSE SKILLS ---
  if (sectionLines.skills && sectionLines.skills.length > 0) {
    const skillsList: string[] = [];
    
    sectionLines.skills.forEach(line => {
      // Split by common delimiters
      const skills = line.split(/[,;•\-|]/)
        .map(s => s.trim())
        .filter(s => s.length > 2 && s.length < 30 && !/^\d+$/.test(s));
      
      skillsList.push(...skills);
    });
    
    extractedData.skills = [...new Set(skillsList)].slice(0, 15); // Remove duplicates, limit to 15
    console.log("✅ Extracted skills:", extractedData.skills?.length);
  }

  // In parseResumeText, update the language parsing section:
if (sectionLines.languages && sectionLines.languages.length > 0) {
  sectionLines.languages.forEach(line => {
    // Look for common language names
    const languages = ['english', 'french', 'spanish', 'german', 'chinese', 'arabic', 'hindi'];
    const cleanLine = line.toLowerCase();
    
    for (const lang of languages) {
      if (cleanLine.includes(lang)) {
        extractedData.languageSkills?.push({
          language: lang.charAt(0).toUpperCase() + lang.slice(1),
          speaking: "",
          reading: "",
          writing: ""
        });
      }
    }
  });
  
  console.log("✅ Extracted languages:", extractedData.languageSkills?.length);
}
  // Clean up empty arrays
  if (!extractedData.education?.length) delete extractedData.education;
  if (!extractedData.workExperience?.length) delete extractedData.workExperience;
  if (!extractedData.languageSkills?.length) delete extractedData.languageSkills;
  if (!extractedData.skills?.length) delete extractedData.skills;

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
        onDataExtracted({}, file); // Provide an empty object to clear form
      } else {
        onDataExtracted(extractedData, file);
      }
      // onClose();
    } catch (error) {
      console.error("❌ OCR failed:", error);
      alert("Failed to extract text from resume. Please try again. Ensure the file is a clear image (JPG/PNG).");
      onClose();
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

        <h2 className="text-xl font-semibold mb-6 text-center">Upload Resume</h2>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm">
          <p className="text-blue-700">
            <strong>Tips for better results:</strong>
            <br />• Use clear, high-resolution images
            <br />• Ensure good lighting and contrast
            {/* <br />• Avoid complex layouts or multiple columns
            <br />• This is client-side OCR, results may vary. */}
          </p>
        </div>

        {!workerReady && (
          <p className="text-center text-gray-600 mb-4">
            Loading... Please wait. This may take a moment.
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