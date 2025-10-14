// components/ResumeUploadModal.tsx

"use client";
import { useState, ChangeEvent } from "react";

// The structure of the data we expect back from our API
export interface ExtractedData {
  firstName?: string;
  middleName?:string;
  lastName?: string;
  email?: string;
  phone?: string;
  education?: { degree: string; institution?: string; year?: string }[];
  workExperience?: { companyName: string; title: string; responsibilities?: string; dates?: string }[];
  languageSkills?: { language: string; speaking?: string; reading?: string; writing?: string }[];
  skills?: string[]; 
}

interface ResumeUploadModalProps {
  onDataExtracted: (data: ExtractedData, file: File) => void;
  onClose: () => void;
}

export default function ResumeUploadModal({ onDataExtracted, onClose }: ResumeUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null); // Clear previous errors on new file selection
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract data from resume.");
      }

      const extractedData: ExtractedData = await response.json();
      
      // Pass the extracted data and the original file back to the parent page
      onDataExtracted(extractedData, file);

    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md relative animate-fade-in">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        <h2 className="text-xl font-semibold mb-6 text-center">Upload Resume to Autofill</h2>
        <p className="text-sm text-center text-gray-500 mb-4">Upload a PDF, PNG, or JPG file to let AI parse the details.</p>

        <div className="flex justify-between items-center mb-4">
          <label htmlFor="file-upload" className="border p-2 rounded-md w-full flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <span className="text-sm text-gray-500 truncate">
              {file ? file.name : "Choose File (PDF, JPG, PNG)"}
            </span>
            <input
              id="file-upload"
              type="file"
              // --- UPDATED: Now accepts PDFs ---
              accept=".png,.jpg,.jpeg,.pdf" 
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>

        {loading && (
          <div className="my-4">
            <p className="text-sm text-center text-gray-600 mb-2">Analyzing with AI... this may take a moment.</p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full animate-indeterminate-progress"></div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-center text-red-600 mb-4">{error}</p>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="bg-[#19183B] hover:bg-[#161950d4] text-white px-6 py-3 rounded-md shadow-md w-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing with AI..." : "Upload & Extract"}
          </button>
        </div>
      </div>
    </div>
  );
}