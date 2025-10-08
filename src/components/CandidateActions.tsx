"use client";
import { useState } from 'react';
import { ApplicationStatus } from '@prisma/client';
import { updateCandidateStatus } from '@/app/actions/candidateActions';

interface CandidateActionsProps {
  candidateId: number;
  currentStatus: ApplicationStatus;
}

export function CandidateActions({ candidateId, currentStatus }: CandidateActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setIsSubmitting(true);
    const result = await updateCandidateStatus(candidateId, newStatus);
    if (result.success) {
      setStatus(newStatus); // Update local state to reflect change immediately
      alert(result.message);
    } else {
      alert(result.message);
    }
    setIsSubmitting(false);
  };
  
  return (
    <div className="flex items-center space-x-2">
       <span className="text-sm font-medium text-gray-600">Current Status: {status}</span>
       <button
        onClick={() => handleStatusChange(ApplicationStatus.INTERVIEW_SCHEDULED)}
        disabled={isSubmitting || status === 'INTERVIEW_SCHEDULED'}
        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        Schedule Interview
      </button>
      <button
        onClick={() => handleStatusChange(ApplicationStatus.REJECTED)}
        disabled={isSubmitting || status === 'REJECTED'}
        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
      >
        Reject
      </button>
       {/* Add more buttons for other statuses as needed */}
    </div>
  );
}