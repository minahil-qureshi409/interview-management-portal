"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
    location: "",
    experience: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.push("/hr/jobs");
  }

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-[#19183B] mb-4 hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-[#19183B] mb-6">Add New Job</h1>

      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <h2 className="text-lg font-semibold text-[#19183B] mb-4">Job Details</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#19183B] mb-1">
              Job Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#A1C2BD] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#19183B] mb-1">
              Department*
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#A1C2BD] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#19183B] mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#A1C2BD] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#19183B] mb-1">
              Requirements*
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#A1C2BD] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#19183B] mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#A1C2BD] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#19183B] mb-1">
              Experience Required
            </label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#A1C2BD] outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-6">
            <button
            //  onClick={() => router.push("/hr/jobs")}
              type="submit"
              className="bg-gradient-to-r from-[#FF9966] to-[#FF5E62] text-black font-semibold py-2 px-6 rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
>
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );  
}
