import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { CandidateActions } from '@/components/CandidateActions'; // We will create this next

const prisma = new PrismaClient();

// This function fetches a single candidate with ALL their related data
async function getCandidateProfile(id: number) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      workExperience: true,
      education: true,
      languageSkills: true,
      // Add other relations if you need them
    },
  });
  return candidate;
}

// The page component receives `params` which contains the dynamic segment (`id`)
export default async function CandidateProfilePage({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id, 10);
  
  // Validate if the ID is a number
  if (isNaN(candidateId)) {
    return notFound();
  }

  const candidate = await getCandidateProfile(candidateId);

  // If no candidate is found for the ID, show a 404 page
  if (!candidate) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold">{`${candidate.firstName} ${candidate.lastName}`}</h1>
              <p className="text-xl text-gray-600">{candidate.title}</p>
              <p className="text-md text-gray-500">{candidate.email} | {candidate.phone}</p>
            </div>
            {/* Action buttons will go here */}
            <CandidateActions candidateId={candidate.id} currentStatus={candidate.status} />
        </div>

        <hr className="my-6" />

        {/* Work Experience Section */}
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Work Experience</h2>
            <div className="space-y-4">
              {candidate.workExperience.map(exp => (
                  <div key={exp.id} className="p-4 border rounded-md">
                      <h3 className="font-bold text-lg">{exp.title} at {exp.companyName}</h3>
                      <p className="text-sm text-gray-500">{exp.country}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.fromDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                      </p>
                      <p className="mt-2 text-gray-700">{exp.responsibilities}</p>
                  </div>
              ))}
            </div>
        </div>

        {/* Education Section */}
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Education</h2>
            <div className="space-y-4">
              {candidate.education.map(edu => (
                  <div key={edu.id} className="p-4 border rounded-md">
                      <h3 className="font-bold text-lg">{edu.degree} from {edu.institute}</h3>
                      <p className="text-sm text-gray-500">{edu.country}</p>
                  </div>
              ))}
            </div>
        </div>

        {/* Add more sections for Language Skills, etc. following the same pattern */}
      </div>
    </div>
  );
}