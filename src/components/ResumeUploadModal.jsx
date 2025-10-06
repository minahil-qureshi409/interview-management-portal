"use client";
import { useState, useEffect } from "react";

export default function ResumeUploadModal({ onDataExtracted, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Disable scrolling on the body
    document.body.style.overflow = "hidden";

    // Cleanup on modal close
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a resume.");

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      const data = await res.json();
      setLoading(false);
      onDataExtracted(data);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("OCR failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 ">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose} // Trigger onClose function passed via props
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-6 text-center">Upload Resume</h2>
        
        {/* File Input Section */}
        <div className="flex justify-between items-center mb-4">
          <label
            htmlFor="file-upload"
            className="border p-2 rounded-md w-full flex items-center justify-between"
          >
            {/* Conditionally render file name or placeholder */}
            <span className="text-sm text-gray-500">
              {file ? file.name : "Choose File"}
            </span>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            className="bg-[#19183B] text-white px-6 py-3 rounded-md hover:bg-[#161950d4] shadow-md w-full"
          >
            {loading ? "Extracting..." : "Upload & Extract"}
          </button>
        </div>
      </div>
    </div>
  );
}
