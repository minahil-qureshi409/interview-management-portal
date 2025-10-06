"use client";

import { useState, useEffect } from "react";
import { Briefcase, Building2, FileText, PlusCircle } from "lucide-react";
import JobApplyModal from "@/components/jobs/JobApplyModal";
// import CreateJobModal from "@/components/jobs/CreateJobModal";
import { Job } from "@/types/job";
import { useRouter } from "next/navigation";


// ✅ Define a proper Job type matching your Prisma schema
// type Job = {
//   id: number;
//   title: string;
//   department: string;
//   description: string;
//   requirements: string;
// };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  // const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const router = useRouter();

  // ✅ Fetch jobs from the database
  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data: Job[] = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }

  // ✅ Open Job Apply Modal
  function handleApply(job: Job) {
    setSelectedJob(job);
    setIsApplyOpen(true);
  }

  // ✅ Create new job and save it to DB
  // async function handleCreate(newJob: Omit<Job, "id">) {
  //   try {
  //     const res = await fetch("/api/jobs", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(newJob),
  //     });

  //     if (!res.ok) throw new Error("Failed to create job");

  //     const created: Job = await res.json();
  //     setJobs((prev) => [created, ...prev]); // prepend new job
  //     setIsCreateOpen(false);
  //   } catch (error) {
  //     console.error("Error creating job:", error);
  //   }
  // }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#19183B]">Available Jobs</h1>
        <button
          onClick={() => router.push("/hr/jobs/create")}
          className="flex items-center gap-2 bg-[#A1C2BD] text-[#19183B] font-semibold py-2 px-4 rounded hover:bg-[#708993] transition"
        >
          <PlusCircle size={18} />
          Create Job
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-md border border-[#A1C2BD] hover:shadow-lg transition p-5 flex flex-col justify-between"
            >
              <h2 className="text-xl font-semibold text-[#19183B] flex items-center gap-2 mb-2">
                <Briefcase className="text-[#708993]" size={20} />
                {job.title}
              </h2>
              <p className="text-sm text-[#708993] flex items-center gap-2 mb-3">
                <Building2 size={16} /> {job.department}
              </p>
              <p className="text-sm text-gray-600 mb-2">{job.description}</p>
              <p className="text-sm text-[#19183B] flex items-start gap-2 mb-4">
                <FileText size={16} className="mt-0.5" />
                {job.requirements}
              </p>
              <button
                onClick={() => handleApply(job)}
                className="bg-[#A1C2BD] text-[#19183B] font-semibold py-2 px-4 rounded hover:bg-[#708993] transition"
              >
                Apply Now
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No jobs available yet.</p>
        )}
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobApplyModal
          open={isApplyOpen}
          onClose={() => setIsApplyOpen(false)}
          job={selectedJob}
        />
      )}

      {/* <CreateJobModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      /> */}
    </div>
  );
}
