"use client";
import { useState } from "react";
import ResumeUploadModal from "@/components/ResumeUploadModal";
import CandidateForm from "@/components/CandidateForm";

export default function CandidatePage() {
  const [extractedData, setExtractedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true); // Open modal initially

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleDataExtracted = (data) => {
    console.log("Extracted Data:", data);
    setExtractedData(data);
    setIsModalOpen(false); // Close modal after extracting data
  };

  // Empty default form
  const emptyForm = {
    personalInfo: { name: "", email: "", phone: "", address: "", linkedin: "" },
    education: [
      { degree: "", institution: "", startYear: "", endYear: "", grade: "" },
    ],
    workExperience: [
      {
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
    ],
    certifications: [{ name: "", organization: "", year: "" }],
    languages: [{ language: "", proficiency: "" }],
    documents: [],
    moreInfo: "",
  };

  return (
    <div className="p2">
      {/* Button to open modal if user wants to upload another resume */}
      {!isModalOpen && !extractedData && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleOpenModal}
            className="px-2 py-2 bg-[#19183B] text-white rounded text-left hover:bg-blue-1000"
          >
            Upload Resume
          </button>
        </div>
      )}

      {/* Resume Modal */}
      {isModalOpen && (
        <ResumeUploadModal
          onDataExtracted={handleDataExtracted}
          onClose={handleCloseModal}
        />
      )}

      {/* Candidate Form */}
      <CandidateForm extractedData={extractedData || emptyForm} />
    </div>
  );
}
