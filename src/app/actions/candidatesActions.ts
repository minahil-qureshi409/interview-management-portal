// components/CandidateActions.tsx

"use client";

import { ApplicationStatus } from '@prisma/client';
import { useState } from 'react';
import ScheduleInterviewModal from '@/components/ScheduleInterviewModal';
import { rejectCandidate, hireCandidate } from '@/app/actions/interviewActions';

interface CandidateActionsProps {
  candidateId: number;
  currentStatus: ApplicationStatus;
}

export function CandidateActions({ candidateId, currentStatus }: CandidateActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: 'reject' | 'hire') => {
    const confirmationMessage = action === 'reject' 
      ? "Are you sure you want to reject this candidate?" 
      : "Are you sure you want to hire this candidate?";
      
    if (window.confirm(confirmationMessage)) {
      setIsSubmitting(true);
      const result = action === 'reject' 
        ? await rejectCandidate(candidateId) 
        : await hireCandidate(candidateId);

      if (!result.success) {
        alert(result.message);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-start sm:items-end gap-4">
        {/* --- STATUS BADGE --- */}
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            currentStatus === 'APPLIED' ? 'bg-blue-100 text-blue-800' :
            currentStatus === 'REVIEWING' ? 'bg-yellow-100 text-yellow-800' :
            currentStatus === 'INTERVIEW_SCHEDULED' ? 'bg-purple-100 text-purple-800' :
            currentStatus === 'HIRED' ? 'bg-green-100 text-green-800' :
            currentStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
        }`}>
          {currentStatus.replace('_', ' ')}
        </div>

        {/* --- ACTION BUTTONS CONTAINER --- */}
        <div className="flex gap-2 min-h-[36px] items-center">
          
          {/* RENDER LOGIC FOR APPLIED/REVIEWING */}
          {(currentStatus === 'APPLIED' || currentStatus === 'REVIEWING') && (
            <>
              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-gray-400"
              >
                Schedule Interview
              </button>
              <button 
                onClick={() => handleAction('reject')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:bg-gray-400"
              >
                {isSubmitting ? '...' : 'Reject'}
              </button>
            </>
          )}

          {/* RENDER LOGIC FOR INTERVIEW_SCHEDULED */}
          {currentStatus === 'INTERVIEW_SCHEDULED' && (
            <>
              <button 
                onClick={() => handleAction('hire')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:bg-gray-400"
              >
                {isSubmitting ? '...' : 'Mark as Hired'}
              </button>
              <button 
                onClick={() => handleAction('reject')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:bg-gray-400"
              >
                {isSubmitting ? '...' : 'Reject'}
              </button>
            </>
          )}

          {/* RENDER LOGIC FOR FINALIZED CANDIDATES */}
          {(currentStatus === 'HIRED' || currentStatus === 'REJECTED') && (
            <p className="text-sm text-gray-500 italic">No further actions</p>
          )}
          
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidateId={candidateId}
      />
    </>
  );
}