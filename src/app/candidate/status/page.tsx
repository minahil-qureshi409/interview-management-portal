// app/candidate/status/page.tsx

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

// This function is secure: it can ONLY fetch the application for the currently logged-in user.
async function getMyApplication() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    include: {
        user: true,
      workExperience: true,
      education: true,
      languageSkills: true,
      documents: true,
      interviews: {
        orderBy: { interviewDate: 'desc' },
        include: {
          // We include the interviewer's details but will only show the name
          interviewer: {
            select: { name: true }
          }
        }
      },
    },
  });

  // If the candidate doesn't have an application yet, the middleware should redirect them.
  // This is a final safeguard.
  if (!candidate) {
    redirect('/candidate/apply');
  }
  return candidate;
}

// Helper component for a visually appealing status badge
function StatusBadge({ status }: { status: string }) {
  let styles = 'bg-gray-100 text-gray-800';
  let icon = <Clock className="w-4 h-4 mr-1.5" />;
  switch (status) {
    case 'APPLIED': case 'REVIEWING': styles = 'bg-blue-100 text-blue-800'; break;
    case 'INTERVIEW_SCHEDULED': case 'INTERVIEW_COMPLETED': styles = 'bg-purple-100 text-purple-800'; break;
    case 'HIRED': styles = 'bg-green-100 text-green-800'; icon = <CheckCircle className="w-4 h-4 mr-1.5" />; break;
    case 'REJECTED': styles = 'bg-red-100 text-red-800'; icon = <XCircle className="w-4 h-4 mr-1.5" />; break;
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${styles}`}>
      {icon}
      {status.replace('_', ' ')}
    </span>
  );
}


export default async function CandidateStatusPage() {
  const application = await getMyApplication();
  if (!application) {
    redirect('/candidate/apply');
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen text-black">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">

        {/* --- Header --- */}
        <div className="flex justify-between items-start flex-col sm:flex-row">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              {`${application.firstName} ${application.lastName}`}
            </h1>
            <p className="text-xl text-gray-600 mt-1">Your Application Details</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <hr className="my-6" />

        {/* --- Application Status Messages --- */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800">Current Status: {application.status.replace('_', ' ')}</h3>
          {application.status === 'APPLIED' && <p className="text-gray-600 mt-2">Your application has been received. We are currently reviewing it and will get back to you shortly. Thank you for your interest!</p>}
          {application.status === 'REVIEWING' && <p className="text-gray-600 mt-2">Your application is currently under review by our hiring team.</p>}
          {application.status === 'REJECTED' && <p className="text-gray-600 mt-2">Thank you for your interest. After careful consideration, we have decided not to move forward at this time. We wish you the best in your job search.</p>}
          {application.status === 'HIRED' && <p className="text-green-700 font-semibold mt-2">Congratulations! You have been selected for the position. Our HR team will be in touch with you shortly with the next steps.</p>}
        </div>

        {/* --- Interview Details --- */}
        {application.interviews.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Your Interview Details</h2>
            <div className="space-y-6">
              {application.interviews.map(interview => (
                <div key={interview.id} className="p-4 border rounded-md bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-800">{interview.interviewType}</h3>
                  <p className="text-md text-gray-600">with {interview.interviewer.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(interview.interviewDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  {interview.meetLink && (
                    <a href={interview.meetLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline hover:text-blue-800 font-medium inline-flex items-center mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Join Meeting
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- All the read-only sections from the HR page are now here --- */}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Work Experience Submitted</h2>
          <div className="space-y-6">
            {application.workExperience.map(exp => (<div key={exp.id}>
              <h3 className="font-bold text-lg text-gray-800">{exp.title}</h3>
              <p className="font-medium text-blue-600">{exp.companyName}</p>
              <p className="text-sm text-gray-500">
                {new Date(exp.fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Present'} | {exp.country}
              </p>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{exp.responsibilities}</p>
            </div>))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Education Submitted</h2>
          <div className="space-y-4">
            {application.education.map(edu => (<div key={edu.id}>
              <h3 className="font-bold text-lg text-gray-800">{edu.degree}</h3>
              <p className="font-medium text-blue-600">{edu.institute}</p>
              <p className="text-sm text-gray-500">{edu.country}</p>
            </div>))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Language Skills</h2>
          <div className="space-y-4">
            {application.languageSkills.map(lang => (<div key={lang.id} className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{lang.language}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
                {lang.speaking && <p><span className="font-medium text-gray-600">Speaking:</span> {lang.speaking}</p>}
                {lang.reading && <p><span className="font-medium text-gray-600">Reading:</span> {lang.reading}</p>}
                {lang.writing && <p><span className="font-medium text-gray-600">Writing:</span> {lang.writing}</p>}
              </div>
            </div>))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Documents Submitted</h2>
          <div className="space-y-3">
            {application.documents.map(doc => (<a
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
            </a>))}
          </div>
        </div>

      </div>
    </div>
  );
}