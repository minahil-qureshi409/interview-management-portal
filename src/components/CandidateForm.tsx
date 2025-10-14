"use client";
import { useState, useEffect, ChangeEvent } from "react";
// Import the ExtractedData interface from ResumeUploadModal for type safety
import { ExtractedData } from "@/components/ResumeUploadModal";

// ... (keep your imports and parseDateString function)

// --- NEW: FUZZY MATCHING HELPER FOR SELECTS ---
/**
 * Finds the best match from a list of options for a given AI-extracted value.
 * It's case-insensitive and handles partial matches.
 * @param value The string from the AI (e.g., "fluent", "bachelor")
 * @param options The array of dropdown options (e.g., proficiencyOptions)
 * @returns The best matching option from the list, or an empty string if no good match is found.
 */
const findBestMatch = (value: string | undefined, options: readonly string[]): string => {
  if (!value) return "";

  const lowerValue = value.toLowerCase();

  // 1. Look for an exact case-insensitive match first
  const exactMatch = options.find(opt => opt.toLowerCase() === lowerValue);
  if (exactMatch) return exactMatch;

  // 2. If no exact match, look for a partial match (e.g., AI says "Bachelor's", option is "Bachelors")
  const partialMatch = options.find(opt => opt.toLowerCase().includes(lowerValue) || lowerValue.includes(opt.toLowerCase()));
  if (partialMatch) return partialMatch;

  // 3. If still no match, return empty string
  return "";
};

/* --- Options --- */
const countryOptions = ["Pakistan", "USA", "UK", "Other"];
const stateOptions = ["State 1", "State 2", "No Selection"]; // These might need to be dynamic based on selected country
const salutationOptions = ["Mr.", "Mrs.", "Ms.", "Dr."]; // Not used in current form but kept for reference
const genderOptions = ["Male", "Female", "Other"]; // Not used in current form but kept for reference
const yesNoOptions = ["Yes", "No"];
const degreeOptions = ["Bachelors", "Masters", "PhD", "Diploma", "Certificate"]; // Added Certificate to match parsing
const proficiencyOptions = ["Basic", "Intermediate", "Fluent", "Native", "Conversational", "Beginner", "Proficient"]; // Added more from parsing

interface CandidateFormProps {
  extractedData: ExtractedData;
  onSubmitSuccess: () => void;
  resumeFile: File | null;
}

const parseDateString = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;

  // Handle "Present"
  if (dateStr.toLowerCase().includes('present')) {
    return null; // Don't set an end date for "Present"
  }

  try {
    // Attempt to create a date object. This is very flexible.
    const date = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    // getMonth() is 0-indexed, so we add 1
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // For strings like "2020", getDate() might be incorrect, so we default to the 1st
    const day = dateStr.includes(' ') ? date.getDate().toString().padStart(2, '0') : '01';

    return `${year}-${month}-${day}`;
  } catch (error) {
    return null;
  }
};

/* --- Component --- */
export default function CandidateForm({ extractedData, onSubmitSuccess, resumeFile }: CandidateFormProps) {
  // Don't duplicate field names in initial state
  const [formData, setFormData] = useState(() => {
    // Create initial state based on extractedData if it exists
    const initialState = {
      workExperience: [],
      education: [],
      languageSkills: [],
      travelMobility: [],
      documents: [] as File[],
      moreInfo: "",
      firstName: "",
      middleName: "",
      lastName: "",
      candidateId: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      skills: [],


    };

    // If extractedData exists, merge it with initial state
    if (extractedData) {
      return {
        ...initialState,
        // Personal info fields
        firstName: extractedData.firstName || "",
        lastName: extractedData.lastName || "",
        email: extractedData.email || "",
        phone: extractedData.phone || "",
        skills: extractedData.skills || [],

        // Arrays need to be mapped to match your form structure
        workExperience: extractedData.workExperience?.map(exp => ({
          companyName: exp.companyName || "",
          title: exp.title || "Position",
          currentlyWorking: "",
          fromDate: "",
          endDate: "",
          country: "",
          responsibilities: exp.responsibilities || "",
        })) || [],
        education: extractedData.education?.map(edu => ({
          institute: edu.institution || "",
          specifyOther: "",
          country: "",
          degree: edu.degree || "",
          major: "",
          fromDate: "",
          endDate: "",
        })) || [],
        languageSkills: extractedData.languageSkills?.map(lang => ({
          language: lang.language || "",
          speaking: lang.speaking || "",
          reading: lang.reading || "",
          writing: lang.writing || "",
        })) || [],
      };
    }

    return initialState;
  });

  // Add console log to debug
  console.log("Initial formData state:", formData);
  console.log("Received extractedData:", extractedData);

  useEffect(() => {
    // We build a new state object based on all incoming props
    // to prevent race conditions.
    const getUpdatedState = (prev: typeof formData) => {
      let updated = { ...prev };

      // 1. Handle extractedData (if it exists)
      if (extractedData && Object.keys(extractedData).length > 0) {
        updated = {
          ...prev,
          firstName: extractedData.firstName || prev.firstName,
          lastName: extractedData.lastName || prev.lastName,
          email: extractedData.email || prev.email,
          phone: extractedData.phone || prev.phone,
          skills: extractedData.skills || prev.skills,

          workExperience: extractedData.workExperience?.map(exp => {
            const dates = exp.dates?.split('-').map(d => d.trim());
            const fromDate = parseDateString(dates?.[0]);
            const endDate = parseDateString(dates?.[1]);

            return {
              companyName: exp.companyName || "",
              title: exp.title || "",
              // --- UPDATE FOR SELECT ---
              currentlyWorking: exp.dates?.toLowerCase().includes('present') ? 'Yes' : (endDate ? 'No' : ''),
              fromDate: fromDate || "",
              endDate: endDate || "",
              country: "", // AI doesn't provide this yet
              responsibilities: exp.responsibilities || "",
            };
          }) || prev.workExperience,

          education: extractedData.education?.map(edu => {
            const endDate = parseDateString(edu.year);
            return {
              institute: edu.institution || "",
              specifyOther: "",
              country: "", // AI doesn't provide this yet
              // --- UPDATE FOR SELECT ---
              degree: findBestMatch(edu.degree, degreeOptions),
              major: "",
              fromDate: "",
              endDate: endDate || "",
            };
          }) || prev.education,

          languageSkills: extractedData.languageSkills?.map(lang => ({
            language: lang.language || "", // This is a text input, so no change needed
            // --- UPDATE FOR SELECTS ---
            speaking: findBestMatch(lang.speaking, proficiencyOptions),
            reading: findBestMatch(lang.reading, proficiencyOptions),
            writing: findBestMatch(lang.writing, proficiencyOptions),
          })) || prev.languageSkills,
        };
      }

      // 2. Handle resumeFile (if it exists and is not already in the list)
      if (resumeFile) {
        const fileExists = updated.documents.some(doc => doc.name === resumeFile.name && doc.size === resumeFile.size);
        if (!fileExists) {
          // Add the resume file to the documents array
          updated.documents = [resumeFile, ...updated.documents];
        }
      }

      return updated;
    };

    setFormData(getUpdatedState);

  }, [extractedData, resumeFile]); // Dependency array now watches both props
  // Use a map so each "section" can remember which index is open independently
  const [openIndices, setOpenIndices] = useState<{ [key: string]: number | null }>({
    workExperience: null,
    education: null,
    languageSkills: null,
    travelMobility: null,
  });

  // Toggle accordion for a given section and index
  const toggleAccordion = (section: string, index: number) => {
    setOpenIndices((prev) => ({
      ...prev,
      [section]: prev?.[section] === index ? null : index,
    }));
  };


  // Generic change handler (works for top-level fields and for array sections)
  const handleChange = (section: string | null, index: number | null, key: string, value: string) => {
    if (typeof index === "number" && section) {
      const updated = [...(formData[section as keyof typeof formData] as Array<any> || [])];
      updated[index] = {
        ...(updated[index] || {}),
        [key]: value,
      };
      setFormData((prev) => ({ ...prev, [section]: updated }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Add row to the section
  const handleAddRow = (section: string, defaultEntry: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section as keyof typeof prev] as Array<any> || []), defaultEntry],
    }));
  };

  // Reset row fields (replace the "✕" delete with this Reset behavior)
  const handleResetRow = (section: string, index: number) => {
    setFormData((prev) => {
      const arr = [...(prev[section as keyof typeof prev] as Array<any> || [])];
      arr[index] = { ...(defaultTemplates[section as keyof typeof defaultTemplates] || {}) };
      return { ...prev, [section]: arr };
    });
  };

  // Default empty templates to reset to — keep them here so reset is consistent
  const defaultTemplates = {
    workExperience: {
      companyName: "",
      title: "",
      currentlyWorking: "",
      fromDate: "",
      endDate: "",
      country: "",
      responsibilities: "",
    },
    education: {
      institute: "",
      specifyOther: "",
      country: "",
      degree: "",
      major: "",
      fromDate: "",
      endDate: "",
    },
    languageSkills: {
      language: "",
      speaking: "",
      reading: "",
      writing: "",
    },
    travelMobility: {
      willingToRelocate: "",
      availabilityForTravel: "",
    },
  };

  const handleDocumentsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    if (newFiles.length > 0) {
      setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...newFiles] }));
    }
  };

  const handleSubmit = async () => {
    const submissionData = new FormData();
    submissionData.append('jsonData', JSON.stringify({ ...formData, documents: undefined }));
    formData.documents.forEach((file) => {
      submissionData.append('documents', file);
    });

    try {
      const res = await fetch("/api/candidates/submit", {
        method: "POST",
        body: submissionData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      await res.json();
      alert("Form submitted successfully!");
      onSubmitSuccess();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to submit form: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-4 h-[70vh] border border-gray-300 rounded shadow-xl flex flex-col">
      <h2 className="text-2xl font-bold sticky top-0 bg-[#19183B] text-white py-2 px-4 z-10 border-b">
        Candidate Application Form
      </h2>

      <div className="overflow-y-auto px-6 py-0 space-y-8 flex-1 text-black ">
        {/* Personal Information */}
        <section className=" rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl text-black">
          <h3 className="font-semibold text-xl sticky top-0  bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300 text-black">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-black">
            <input
              type="text"
              placeholder="First Name *"
              value={formData.firstName || ""}
              onChange={(e) =>
                handleChange(null, null, "firstName", e.target.value)
              }
              className="h-9 text-black border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            {/* <input
              type="text"
              placeholder="Candidate ID (Auto Generated)"
              value={formData.candidateId || ""}
              readOnly
              className="h-9 border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            /> */}

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

        {/* Work Experience */}
        <section className="rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Work Experience
          </h3>

          {(formData.workExperience || []).map((we, i) => (
            <div key={i} className="border rounded p-2 mb-4 space-y-1 relative">
              {/* Accordion Header */}
              <div
                className="cursor-pointer flex justify-between items-center"
                onClick={() => toggleAccordion("workExperience", i)}
              >
                <h4 className="font-semibold text-lg">
                  {we.companyName || "Company Name"}
                </h4>
                <span className="text-md">
                  {openIndices.workExperience === i ? "▲" : "▼"}
                </span>
              </div>

              {/* Accordion Content */}
              {openIndices.workExperience === i && (
                <div className="mt-4 space-y-4">
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
                        handleChange(
                          "workExperience",
                          i,
                          "title",
                          e.target.value
                        )
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
                        handleChange(
                          "workExperience",
                          i,
                          "endDate",
                          e.target.value
                        )
                      }
                      className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={we.currentlyWorking === "Yes"}
                    />
                    <select
                      value={we.country || ""}
                      onChange={(e) =>
                        handleChange(
                          "workExperience",
                          i,
                          "country",
                          e.target.value
                        )
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

                  {/* Reset button (replaces the ✕) */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleResetRow("workExperience", i)}
                      className="text-sm border border-gray-400 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
                      type="button"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() =>
              handleAddRow("workExperience", {
                ...defaultTemplates.workExperience,
              })
            }
            className="text-[#A1C2BD] font-semibold"
            type="button"
          >
            + Add Work Experience
          </button>
        </section>

        {/* Formal Education */}
        <section className="rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Formal Education
          </h3>

          {(formData.education || []).map((edu, i) => (
            <div key={i} className="border rounded p-2 mb-4 space-y-2 relative">
              <div
                className="cursor-pointer flex justify-between items-center"
                onClick={() => toggleAccordion("education", i)}
              >
                <h4 className="font-semibold text-lg">
                  {edu.institute || "Institute"}
                </h4>
                <span className="text-md">
                  {openIndices.education === i ? "▲" : "▼"}
                </span>
              </div>

              {openIndices.education === i && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Institute *"
                      value={edu.institute || ""}
                      onChange={(e) =>
                        handleChange(
                          "education",
                          i,
                          "institute",
                          e.target.value
                        )
                      }
                      className="h-9 border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Specify if Other"
                      value={edu.specifyOther || ""}
                      onChange={(e) =>
                        handleChange(
                          "education",
                          i,
                          "specifyOther",
                          e.target.value
                        )
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
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleResetRow("education", i)}
                      className="text-sm border border-gray-400 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
                      type="button"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() =>
              handleAddRow("education", { ...defaultTemplates.education })
            }
            className="text-[#A1C2BD] font-semibold"
            type="button"
          >
            + Add Education
          </button>
        </section>

        {/* Language Skills */}
        <section className="rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Language Skills
          </h3>

          {(formData.languageSkills || []).map((lang, i) => (
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

              <div className="flex justify-end col-span-4">
                <button
                  onClick={() => handleResetRow("languageSkills", i)}
                  className="text-sm border border-gray-400 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() =>
              handleAddRow("languageSkills", {
                ...defaultTemplates.languageSkills,
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

          {(formData.travelMobility || []).map((tm, i) => (
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

              <div className="flex justify-end col-span-2">
                <button
                  onClick={() => handleResetRow("travelMobility", i)}
                  className="text-sm border border-gray-400 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() =>
              handleAddRow("travelMobility", {
                ...defaultTemplates.travelMobility,
              })
            }
            className="text-[#A1C2BD] font-semibold"
            type="button"
          >
            + Add Travel Mobility
          </button>
        </section>

        {/* Additional Information and Skills (if you add a form field for skills) */}
        {/*
        <section className="rounded-lg p-2 pt-0 pb-3 mt-6 bg-[#f5f5f5] shadow-xl">
          <h3 className="font-semibold text-xl sticky top-0 bg-[#f5f5f5] pb-3 pt-3 px-3 z-10 mb-3 border-b border-gray-300">
            Skills
          </h3>
          <textarea
            value={formData.skills?.join(', ') || ''} // Display skills as comma-separated string
            onChange={(e) => handleChange(null, null, "skills", e.target.value.split(',').map(s => s.trim()))}
            rows={3}
            className="w-full border border-gray-300 p-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="List your skills, separated by commas..."
          />
        </section>
        */}

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
          {/* --- NEW: VISUAL CONFIRMATION --- */}
          {/* Display the list of uploaded files */}
          {formData.documents.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-gray-700">Attached files:</p>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                {formData.documents.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
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