// app/hr/interviews/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import InterviewTableActions from '@/components/InterviewTableActions'; // Import the new component

async function getScheduledInterviews() {
  const candidates = await prisma.candidate.findMany({
    where: {
      status: 'INTERVIEW_SCHEDULED',
    },
    include: {
      interviews: {
        orderBy: {
          interviewDate: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return candidates;
}

export default async function InterviewsPage() {
  const candidates = await getScheduledInterviews();

  return (
    <div className="p-4 sm:p-8 text-black">
      <h1 className="text-3xl font-bold mb-6">Scheduled Interviews</h1>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Interview Date & Time</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Interview Type</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Interviewer</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length > 0 ? (
              candidates.map(candidate => {
                const latestInterview = candidate.interviews[0];
                return (
                  <tr key={candidate.id}>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <Link href={`/hr/applications/${candidate.id}`} className="text-blue-600 hover:underline font-semibold">
                        {`${candidate.firstName} ${candidate.lastName}`}
                      </Link>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {latestInterview ? new Date(latestInterview.interviewDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {latestInterview?.interviewType || 'N/A'}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {latestInterview?.interviewerName || 'N/A'}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                      {/* --- USE THE NEW COMPONENT HERE --- */}
                      {latestInterview && (
                        <InterviewTableActions
                          candidateId={candidate.id}
                          interviewId={latestInterview.id}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No interviews scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}