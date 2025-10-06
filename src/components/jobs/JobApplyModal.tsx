"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"; // from shadcn/ui
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Job } from "@/types/job";

// interface Job {
//     id: string;
//     title: string;
//     department: string;
//     description: string;
//     requirements: string;
// }

interface JobApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: Job;
}


export default function JobApplyModal({ open, onClose, job }: JobApplyModalProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = {
            jobId: job.id,
            name: formData.get("name"),
            email: formData.get("email"),
            resumeUrl: formData.get("resumeUrl"),
            skills: formData.get("skills"),
            experience: formData.get("experience"),
        };

        const res = await fetch("/api/applications", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            onClose();
            router.push("/thank-you"); // redirect to thank you page
        } else {
            alert("Something went wrong. Please try again.");
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-[#19183B] text-[#E7F2EF]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#A1C2BD]">
                        Apply for {job.title}
                    </DialogTitle>
                    <DialogDescription className="text-[#708993] space-y-2">
                        <span className="block">Department: {job.department}</span>
                        <span className="block">{job.description}</span>
                        <span className="block text-sm">Requirements: {job.requirements}</span>
                    </DialogDescription>



                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <Input name="name" placeholder="Full Name" className="bg-white text-black" required />
                    <Input name="email" type="email" placeholder="Email" className="bg-white text-black" required />
                    <Input name="resumeUrl" placeholder="Resume Link" className="bg-white text-black" required />
                    <Input name="skills" placeholder="Skills" className="bg-white text-black" />
                    <Textarea name="experience" placeholder="Experience" className="bg-white text-black" />

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#A1C2BD] text-[#19183B] hover:bg-[#708993]"
                        >
                            {loading ? "Submitting..." : "Apply"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
