// app/CandidatePage.tsx

"use client";
import { useState } from "react";
import ResumeUploadModal, { ExtractedData } from "@/components/ResumeUploadModal";
import CandidateForm from "@/components/CandidateForm";

export default function CandidatePage() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // --- NEW: State to track if the initial resume upload was successful ---
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setShowSuccessMessage(false);
  };

  const handleCloseModal = () => {
    // User closed the modal WITHOUT uploading. Show the form.
    setIsModalOpen(false);
    setShowCandidateForm(true); 
  };

  // --- MODIFIED: Now accepts the file object along with extracted data ---
  const handleDataExtracted = (data: ExtractedData, file: File) => {
    console.log("Resume file received in page:", file.name);
    setExtractedData(data);
    setResumeFile(file);      // Store the resume file
    setIsModalOpen(false);
    setShowCandidateForm(true);
    setShowSuccessMessage(false);
    setResumeUploaded(true); // --- NEW: Mark that the upload was successful
  };

  const handleCandidateFormSubmitSuccess = () => {
    setShowCandidateForm(false);
    setShowSuccessMessage(true);
    setExtractedData(null);
    setResumeFile(null);
    setResumeUploaded(false); // Reset for a new application
  };

  const handleStartNewApplication = () => {
    setExtractedData(null);
    setShowSuccessMessage(false);
    setShowCandidateForm(false);
    setResumeFile(null);
    setResumeUploaded(false); // Reset for a new application
    setIsModalOpen(true);
  };

  const emptyForm: ExtractedData = {
    firstName: "", lastName: "", email: "", phone: "",
    workExperience: [], education: [], languageSkills: [], skills: []
  };

  return (
    <div className="p-3">
      {/* --- NEW LOGIC: Button is shown ONLY if form is visible AND resume was NOT initially uploaded --- */}
      {showCandidateForm && !resumeUploaded && !isModalOpen && !showSuccessMessage && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-[#19183B] text-white rounded hover:bg-[#161950d4]"
          >
            Upload Resume
          </button>
        </div>
      )}

      {/* OCR Upload Modal */}
      {isModalOpen && (
        <ResumeUploadModal
          onDataExtracted={handleDataExtracted} // Pass the modified handler
          onClose={handleCloseModal}
        />
      )}

      {/* Candidate Form */}
      {showCandidateForm && !isModalOpen && (
        <CandidateForm
          extractedData={extractedData || emptyForm}
          onSubmitSuccess={handleCandidateFormSubmitSuccess}
          resumeFile={resumeFile} // --- NEW: Pass the resume file to the form
        />
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg max-w-lg mx-auto mt-10 shadow-lg">
          <h3 className="text-2xl font-bold text-green-700 mb-4">Application Submitted Successfully!</h3>
          <p className="text-green-600 mb-6">Thank you for your application. We will review it shortly.</p>
          <button
            onClick={handleStartNewApplication}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Submit New Application
          </button>
        </div>
      )}
    </div>
  );
}