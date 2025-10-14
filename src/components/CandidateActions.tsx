// components/CandidateActions.tsx

"use client";

import { ApplicationStatus } from '@prisma/client';
import { useState } from 'react'; 
import ScheduleInterviewModal from './ScheduleInterviewModal'; 
import { rejectCandidate } from '@/app/actions/interviewActions';

interface CandidateActionsProps {
  candidateId: number;
  currentStatus: ApplicationStatus;
}

export function CandidateActions({ candidateId, currentStatus }: CandidateActionsProps) {
  // State to control the modal's visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    // Add a confirmation dialog for safety
    if (window.confirm("Are you sure you want to reject this candidate?")) {
      setIsSubmitting(true);
      const result = await rejectCandidate(candidateId);
      if (!result.success) {
        alert(result.message); // Show error if it fails
      }
      // The page will automatically re-render with the new status due to revalidatePath
      setIsSubmitting(false);
    }
  };

  // A simple function to get the status display style
  const getStatusClass = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800';
      case 'REVIEWING': return 'bg-yellow-100 text-yellow-800';
      case 'INTERVIEW_SCHEDULED': return 'bg-green-100 text-green-800';
      case 'HIRED': return 'bg-purple-100 text-purple-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="flex flex-col items-start sm:items-end gap-4">
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusClass(currentStatus)}`}>
          {currentStatus.replace('_', ' ')}
        </div>

        <div className="flex gap-2">
          {/* Only show the Schedule button for appropriate statuses */}
          {currentStatus !== 'HIRED' && currentStatus !== 'REJECTED' && (
             <>
            <button
              onClick={() => setIsModalOpen(true)} // Open the modal on click
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Schedule Interview
            </button>
          
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:bg-gray-400"
          >
            {isSubmitting ? 'Rejecting...' : 'Reject'}
          </button>
          </>
        )}
        </div>
      </div>

      {/* Render the modal, it will only be visible when isModalOpen is true */}
      <ScheduleInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidateId={candidateId}
      />
    </>
  );
}