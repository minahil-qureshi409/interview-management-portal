// app/candidates/[id]/page.tsx (or wherever your component is located)

import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { CandidateActions } from '@/components/CandidatesActions'; // Assuming this component exists
// import { getAuthSession } from '@/lib/auth'; // Import the session helper

const prisma = new PrismaClient();

// fetches a single candidate with ALL their related data
async function getCandidateProfile(id: number) {
  //   const session = await getAuthSession();
  // if (!session?.user) redirect('/auth/signin');
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    // Use 'select' to explicitly include optional fields and relations
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      title: true,
      phone: true,
      status: true,
       user: {
        select: {
          email: true,
        },
      },
      // --- all the relations you need ---
      workExperience: true,
      education: true,
      languageSkills: true,
      documents: true,
      interviews: {
        orderBy: {
          interviewDate: 'desc',
        },
        include: {
          interviewer: {
            select: { email: true }
          }
        }
      },
    },
  });

  // --- SECURITY CHECK ---
  // If the logged-in user is a CANDIDATE, we must verify they are only viewing their own profile.
  // if (session.user.role === 'CANDIDATE' && candidate?.email !== session.user.email) {
  //   // They are trying to view someone else's profile. Block them.
  //   return null; 
  // }
  return candidate;
}
// The page component receives `params` which contains the dynamic segment (`id`)
export default async function CandidateProfilePage({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id, 10);

  if (isNaN(candidateId)) {
    return notFound();
  }

  const candidate = await getCandidateProfile(candidateId);

  if (!candidate) {
    return notFound();
  }

  // Get the most recent interview, if it exists
  const latestInterview = candidate.interviews.length > 0 ? candidate.interviews[0] : null;

  return (
    <div className="container mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen text-black">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-6xl mx-auto">
        {/* --- Header --- */}
        <div className="flex justify-between items-start flex-col sm:flex-row">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              {`${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`}
            </h1>
            <p className="text-xl text-gray-600 mt-1">{candidate.title || 'No Title Provided'}</p>
            <div className="text-md text-gray-500 mt-2 space-x-4">
              <span>{candidate.user.email}</span>
              <span>|</span>
              <span>{candidate.phone || 'No Phone Provided'}</span>
            </div>
          </div>
          {/* --- Action buttons --- */}
          <CandidateActions candidateId={candidate.id} currentStatus={candidate.status} latestInterview={latestInterview} />
        </div>

        <hr className="my-6" />

        
        {/* Scheduled Interviews & Feedback Section */}
        {candidate.interviews.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Interviews</h2>
            <div className="space-y-6">
              {candidate.interviews.map(interview => (
                <div key={interview.id} className="p-4 border rounded-md bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-800">{interview.interviewType} with {interview.interviewerName}</h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(interview.interviewDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>

                  {interview.meetLink && (
                    <a
                      href={interview.meetLink}
                      target="_blank" // Opens the link in a new tab
                      rel="noopener noreferrer" // Security best practice
                      className="text-sm text-blue-600 hover:underline hover:text-blue-800 font-medium inline-flex items-center mt-2"
                    >
                      {/* Optional: Add an icon for better UX */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Join Meeting
                    </a>
                  )}

                  {/* Display the feedback */}
                  {interview.feedback && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-md text-gray-800">Feedback:</h4>
                      <p className="mt-1 text-gray-700 whitespace-pre-wrap">{interview.feedback}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2 text-black">Work Experience</h2>
          <div className="space-y-6">
            {candidate.workExperience.length > 0 ? (
              candidate.workExperience.map(exp => (
                <div key={exp.id}>
                  <h3 className="font-bold text-lg text-gray-800">{exp.title}</h3>
                  <p className="font-medium text-blue-600">{exp.companyName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Present'} | {exp.country}
                  </p>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{exp.responsibilities}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No work experience provided.</p>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Education</h2>
          <div className="space-y-4">
            {candidate.education.length > 0 ? (
              candidate.education.map(edu => (
                <div key={edu.id}>
                  <h3 className="font-bold text-lg text-gray-800">{edu.degree}</h3>
                  <p className="font-medium text-blue-600">{edu.institute}</p>
                  <p className="text-sm text-gray-500">{edu.country}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No education information provided.</p>
            )}
          </div>
        </div>

        {/* --- Language Skills Section --- */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Language Skills</h2>
          <div className="space-y-4">
            {candidate.languageSkills.length > 0 ? (
              candidate.languageSkills.map(lang => (
                <div key={lang.id} className="p-4 border rounded-md bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-800">{lang.language}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
                    {lang.speaking && <p><span className="font-medium text-gray-600">Speaking:</span> {lang.speaking}</p>}
                    {lang.reading && <p><span className="font-medium text-gray-600">Reading:</span> {lang.reading}</p>}
                    {lang.writing && <p><span className="font-medium text-gray-600">Writing:</span> {lang.writing}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No language skills provided.</p>
            )}
          </div>
        </div>

        {/* --- Documents Section --- */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Documents</h2>
          <div className="space-y-3">
            {candidate.documents.length > 0 ? (
              candidate.documents.map(doc => (
                <a
                  key={doc.id}
                  href={doc.fileUrl || '#'} // The fileUrl from your database
                  target="_blank" // Opens the link in a new tab
                  rel="noopener noreferrer" // Security best practice for new tabs
                  className="flex items-center p-3 border rounded-md bg-white hover:bg-blue-50 transition-colors"
                >
                  {/* Paperclip Icon SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-blue-600 font-medium">{doc.fileName}</span>
                  {doc.fileType && <span className="text-xs text-gray-400 ml-auto bg-gray-100 px-2 py-1 rounded-full">{doc.fileType}</span>}
                </a>
              ))
            ) : (
              <p className="text-gray-500">No documents uploaded.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}