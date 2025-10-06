// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";

// interface CreateJobModalProps {
//   open: boolean;
//   onClose: () => void;
//   onCreate: (newJob: {
//     id: string;
//     title: string;
//     department: string;
//     description: string;
//     requirements: string;
//   }) => void;
// }

// export default function CreateJobModal({
//   open,
//   onClose,
//   onCreate,
// }: CreateJobModalProps) {
//   const [formData, setFormData] = useState({
//     title: "",
//     department: "",
//     description: "",
//     requirements: "",
//   });

//   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   }

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     const newJob = { id: Date.now().toString(), ...formData };
//     onCreate(newJob);
//     onClose();
//   }

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md bg-white">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-semibold text-[#19183B]">
//             Create New Job
//           </DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <Label htmlFor="title">Job Title</Label>
//             <Input
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <Label htmlFor="department">Department</Label>
//             <Input
//               id="department"
//               name="department"
//               value={formData.department}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <Label htmlFor="description">Description</Label>
//             <Input
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <Label htmlFor="requirements">Requirements</Label>
//             <Input
//               id="requirements"
//               name="requirements"
//               value={formData.requirements}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <DialogFooter>
//             <Button type="submit" className="bg-[#A1C2BD] text-[#19183B]">
//               Create Job
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
