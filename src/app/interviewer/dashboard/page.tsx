// app/interviewer/dashboard/page.tsx

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function getMyInterviews() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect('/auth/signin');

  // Fetch interviews assigned to the currently logged-in user
  return await prisma.interview.findMany({
    where: {
      interviewerId: session.user.id,
      candidate: {
        // Only show interviews that are still in an active state
        status: {
          in: ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'],
        },
      },
    },
    include: {
      // We need the candidate's details for display and linking
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          user: { select: { email: true } } // Fetch email for display
        },
      },
    },
    orderBy: {
      interviewDate: 'asc', // Show the soonest interviews first
    },
  });
}

export default async function InterviewerDashboard() {
  const interviews = await getMyInterviews();

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Scheduled Interviews</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
               <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Interview Date & Time</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
             
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {interviews.length > 0 ? (
              interviews.map(interview => (
                <tr key={interview.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    {/* --- THIS IS THE CLICKABLE LINK --- */}
                    <Link href={`/hr/applications/${interview.candidate.id}`} className="text-blue-600 hover:underline font-semibold">
                      {`${interview.candidate.firstName} ${interview.candidate.lastName}`}
                    </Link>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    {new Date(interview.interviewDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    {interview.candidate.user?.email || 'N/A'}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                        interview.candidate.status === 'INTERVIEW_COMPLETED' ? 'bg-green-200 text-green-900' : 'bg-purple-200 text-purple-900'
                    }`}>
                      {interview.candidate.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  You have no upcoming interviews assigned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}