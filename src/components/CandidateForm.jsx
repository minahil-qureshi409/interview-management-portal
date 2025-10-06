"use client";
import { useState } from "react";

const countryOptions = ["Pakistan", "USA", "UK", "Other"]; // add more as needed
const stateOptions = ["State 1", "State 2", "No Selection"]; // example
const salutationOptions = ["Mr.", "Mrs.", "Ms.", "Dr."];
const genderOptions = ["Male", "Female", "Other"];
const yesNoOptions = ["Yes", "No"];
const degreeOptions = ["Bachelors", "Masters", "PhD", "Diploma"];
const proficiencyOptions = ["Basic", "Intermediate", "Fluent", "Native"];

export default function CandidateForm({ extractedData }) {
  const [formData, setFormData] = useState(extractedData);

  const handleChange = (section, index, key, value) => {
    if (typeof index === "number") {
      const updated = [...formData[section]];
      updated[index][key] = value;
      setFormData({ ...formData, [section]: updated });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  const handleAddRow = (section, defaultEntry) => {
    setFormData({
      ...formData,
      [section]: [...(formData[section] || []), defaultEntry],
    });
  };

  const handleRemoveRow = (section, index) => {
    const updated = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updated });
  };

  const handleDocumentsChange = (e) => {
    setFormData({ ...formData, documents: Array.from(e.target.files) });
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/candidate/submit", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    alert("Form submitted successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto mt-4 h-[80vh] border rounded shadow flex flex-col">
      {/* Scrollable form container */}
      <h2 className="text-2xl font-bold sticky top-0 bg-[#19183B] text-white py-2 px-4 z-10 border-b">
        Candidate Application Form
      </h2>
      <div className="overflow-y-auto px-6 py-0 space-y-8 flex-1 ">
        {/* Personal Information */}
        <section className=" rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0  bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="First Name *"
              value={formData.firstName || ""}
              onChange={(e) =>
                handleChange(null, null, "firstName", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              placeholder="Middle Name"
              value={formData.middleName || ""}
              onChange={(e) =>
                handleChange(null, null, "middleName", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Last Name *"
              value={formData.lastName || ""}
              onChange={(e) =>
                handleChange(null, null, "lastName", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              placeholder="Candidate ID"
              value={formData.candidateId || ""}
              onChange={(e) =>
                handleChange(null, null, "candidateId", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Title"
              value={formData.title || ""}
              onChange={(e) =>
                handleChange(null, null, "title", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company || ""}
              onChange={(e) =>
                handleChange(null, null, "company", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) =>
                handleChange(null, null, "email", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={(e) =>
                handleChange(null, null, "phone", e.target.value)
              }
              className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </section>

        <section className="rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Work Experience
          </h3>
          {formData.workExperience?.map((we, i) => (
            <div key={i} className="border rounded p-5 mb-4 space-y-2 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={we.companyName || ""}
                  onChange={(e) =>
                    handleChange(
                      "workExperience",
                      i,
                      "companyName",
                      e.target.value
                    )
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Title *"
                  value={we.title || ""}
                  onChange={(e) =>
                    handleChange("workExperience", i, "title", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <select
                  value={we.currentlyWorking || ""}
                  onChange={(e) =>
                    handleChange(
                      "workExperience",
                      i,
                      "currentlyWorking",
                      e.target.value
                    )
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Are you currently working here?</option>
                  {yesNoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  placeholder="From Date *"
                  value={we.fromDate || ""}
                  onChange={(e) =>
                    handleChange(
                      "workExperience",
                      i,
                      "fromDate",
                      e.target.value
                    )
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={we.endDate || ""}
                  onChange={(e) =>
                    handleChange("workExperience", i, "endDate", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={we.currentlyWorking === "Yes"}
                />
                <select
                  value={we.country || ""}
                  onChange={(e) =>
                    handleChange("workExperience", i, "country", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Country/Region</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Responsibilities"
                value={we.responsibilities || ""}
                onChange={(e) =>
                  handleChange(
                    "workExperience",
                    i,
                    "responsibilities",
                    e.target.value
                  )
                }
                className="w-full border p-2 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
              />
              <button
                onClick={() => handleRemoveRow("workExperience", i)}
                className="absolute top-1 right-1 text-red-600 font-semibold text-sm"
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              handleAddRow("workExperience", {
                companyName: "",
                title: "",
                currentlyWorking: "",
                fromDate: "",
                endDate: "",
                country: "",
                responsibilities: "",
              })
            }
            className="text-[#A1C2BD] font-semibold"
            type="button"
          >
            + Add Work Experience
          </button>
        </section>

        <section className=" rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Formal Education
          </h3>
          {formData.education?.map((edu, i) => (
            <div key={i} className="border rounded p-5 mb-4 space-y-2 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Institute *"
                  value={edu.institute || ""}
                  onChange={(e) =>
                    handleChange("education", i, "institute", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Specify if Other"
                  value={edu.specifyOther || ""}
                  onChange={(e) =>
                    handleChange("education", i, "specifyOther", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                  value={edu.country || ""}
                  onChange={(e) =>
                    handleChange("education", i, "country", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Country</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={edu.degree || ""}
                  onChange={(e) =>
                    handleChange("education", i, "degree", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Degree</option>
                  {degreeOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Major"
                  value={edu.major || ""}
                  onChange={(e) =>
                    handleChange("education", i, "major", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="date"
                  placeholder="From Date"
                  value={edu.fromDate || ""}
                  onChange={(e) =>
                    handleChange("education", i, "fromDate", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={edu.endDate || ""}
                  onChange={(e) =>
                    handleChange("education", i, "endDate", e.target.value)
                  }
                  className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                onClick={() => handleRemoveRow("education", i)}
                className="absolute top-1 right-1 text-red-600 font-semibold text-sm"
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              handleAddRow("education", {
                institute: "",
                specifyOther: "",
                country: "",
                degree: "",
                major: "",
                fromDate: "",
                endDate: "",
              })
            }
            className="text-[#A1C2BD] font-semibold"
            type="button"
          >
            + Add Education
          </button>
        </section>

        <section className="rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Language Skills
          </h3>
          {formData.languageSkills?.map((lang, i) => (
            <div
              key={i}
              className="border rounded p-5 mb-4 space-y-2 relative grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <input
                type="text"
                placeholder="Language *"
                value={lang.language || ""}
                onChange={(e) =>
                  handleChange("languageSkills", i, "language", e.target.value)
                }
                className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <select
                value={lang.speaking || ""}
                onChange={(e) =>
                  handleChange("languageSkills", i, "speaking", e.target.value)
                }
                className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Speaking Proficiency</option>
                {proficiencyOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={lang.reading || ""}
                onChange={(e) =>
                  handleChange("languageSkills", i, "reading", e.target.value)
                }
                className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Reading Proficiency</option>
                {proficiencyOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={lang.writing || ""}
                onChange={(e) =>
                  handleChange("languageSkills", i, "writing", e.target.value)
                }
                className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Writing Proficiency</option>
                {proficiencyOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemoveRow("languageSkills", i)}
                className="absolute top-1 right-1 text-red-600 font-semibold text-sm"
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              handleAddRow("languageSkills", {
                language: "",
                speaking: "",
                reading: "",
                writing: "",
              })
            }
            className="text-[#A1C2BD] font-semibold"
            type="button"
          >
            + Add Language
          </button>
        </section>

        {/* Travel Mobility */}
        <section className=" rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Travel Mobility
          </h3>
          {formData.travelMobility?.map((tm, i) => (
            <div
              key={i}
              className="border rounded p-5 mb-4 space-y-2 relative grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <select
                value={tm.willingToRelocate || ""}
                onChange={(e) =>
                  handleChange(
                    "travelMobility",
                    i,
                    "willingToRelocate",
                    e.target.value
                  )
                }
                className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Willing to Relocate</option>
                {yesNoOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={tm.availabilityForTravel || ""}
                onChange={(e) =>
                  handleChange(
                    "travelMobility",
                    i,
                    "availabilityForTravel",
                    e.target.value
                  )
                }
                className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Availability for Travel</option>
                {yesNoOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemoveRow("travelMobility", i)}
                className="absolute top-1 right-1 text-red-600 font-semibold text-sm"
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              handleAddRow("travelMobility", {
                willingToRelocate: "",
                availabilityForTravel: "",
              })
            }
            className="text-[#A1C2BD] font-semibold"
            type="button"
          >
            + Add Travel Mobility
          </button>
        </section>

        {/* More Information */}
        <section className=" rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Additional Information
          </h3>
          <textarea
            value={formData.moreInfo || ""}
            onChange={(e) =>
              handleChange(null, null, "moreInfo", e.target.value)
            }
            rows={5}
            className="w-full border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Any additional info..."
          />
        </section>

        {/* Documents */}
        <section className=" rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Documents
          </h3>
          <input
            type="file"
            multiple
            onChange={handleDocumentsChange}
            className="border border-gray-300 p-2 rounded-md w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </section>
        {/* Submit */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#19183B] text-white px-4 py-2 mb-5 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
