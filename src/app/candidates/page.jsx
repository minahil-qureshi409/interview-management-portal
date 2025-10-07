"use client";
import { useState } from "react";
import ResumeUploadModal from "@/components/ResumeUploadModal";
import CandidateForm from "@/components/CandidateForm";

export default function CandidatePage() {
  const [extractedData, setExtractedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true); // Modal opens initially

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleDataExtracted = (data) => {
    console.log("Extracted Data:", data);
    setExtractedData(data);
    setIsModalOpen(false); // Close modal after extraction
  };

  // Empty form structure for fallback
  const emptyForm = {
    firstName: "",
    middleName: "",
    lastName: "",
    candidateId: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    workExperience: [],
    education: [],
    languageSkills: [],
    travelMobility: [],
    documents: [],
    moreInfo: "",
  };

  return (
    <div className="p-3">
      {/* Upload Resume Button */}
      {!isModalOpen && (
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
          onDataExtracted={handleDataExtracted}
          onClose={handleCloseModal}
        />
      )}

      {/* Candidate Form with Extracted Data */}
      <CandidateForm extractedData={extractedData || emptyForm} />
    </div>
  );
}
