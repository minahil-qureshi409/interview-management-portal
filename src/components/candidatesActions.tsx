// components/CandidateActions.tsx

"use client";

import { useSession } from "next-auth/react";
import { ApplicationStatus, Interview } from '@prisma/client';
import { useState } from 'react';
import ScheduleInterviewModal from '@/components/ScheduleInterviewModal';
import { rejectCandidate, hireCandidate, moveToApplied } from '@/app/actions/interviewActions';

interface CandidateActionsProps {
  candidateId: number;
  currentStatus: ApplicationStatus;
  latestInterview: Interview | null;
}

// --- THIS IS THE FIX ---
// Move the helper function outside or to the top of the component.
// This ensures it is declared before it is ever called.
const getStatusClass = (status: ApplicationStatus) => {
  switch (status) {
    case 'APPLIED': return 'bg-blue-100 text-blue-800';
    case 'REVIEWING': return 'bg-yellow-100 text-yellow-800';
    case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800';
    case 'INTERVIEW_COMPLETED': return 'bg-orange-100 text-orange-800';
    case 'HIRED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
// --- END OF FIX ---


export function CandidateActions({ candidateId, currentStatus, latestInterview }: CandidateActionsProps) {
  // const { data: session } = useSession();
  // const userRole = session?.user?.role;
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: 'reject' | 'hire' | 'cancel') => {
    // ... (this function is correct)
  };

  // Logic for CANDIDATE role
  // if (userRole === 'CANDIDATE') {
  //   // This will now work because getStatusClass is declared above.
  //   return (
  //     <div className="flex flex-col items-start sm:items-end gap-4">
  //       <div className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusClass(currentStatus)}`}>
  //         {currentStatus.replace('_', ' ')}
  //       </div>
  //     </div>
  //   );
  // }

  // --- Logic for HR_MANAGER and INTERVIEWER roles ---
  const btnPrimary = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-gray-400";
  const btnSecondary = "px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm disabled:bg-gray-400";
  const btnSuccess = "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:bg-gray-400";
  const btnDanger = "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:bg-gray-400";
  const btnWarning = "px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm disabled:bg-gray-400";

  return (
    <>
      <div className="flex flex-col items-start sm:items-end gap-4">
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusClass(currentStatus)}`}>
          {currentStatus.replace('_', ' ')}
        </div>

        <div className="flex gap-2 min-h-[36px] items-center">
          {(currentStatus === 'APPLIED' || currentStatus === 'REVIEWING') && (
            <>
              <button onClick={() => setIsScheduleModalOpen(true)} className={btnPrimary}>Schedule Interview</button>
              <button onClick={() => handleAction('reject')} className={btnDanger}>Reject</button>
            </>
          )}
          {currentStatus === 'INTERVIEW_SCHEDULED' && (
            <>
              <button onClick={() => setIsScheduleModalOpen(true)} className={btnSecondary}>Update Interview</button>
              <button onClick={() => handleAction('cancel')} className={btnWarning}>Cancel Interview</button>
            </>
          )}
          {currentStatus === 'INTERVIEW_COMPLETED' && (
            <>
              <button onClick={() => handleAction('hire')} className={btnSuccess}>Hire</button>
              <button onClick={() => handleAction('reject')} className={btnDanger}>Reject</button>
            </>
          )}
          {(currentStatus === 'HIRED' || currentStatus === 'REJECTED') && (
            <p className="text-sm text-gray-500 italic">No further actions</p>
          )}
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        candidateId={candidateId}
        initialData={latestInterview}
      />
    </>
  );
}