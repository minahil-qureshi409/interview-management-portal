// components/InterviewActions.tsx

"use client";

import { useState } from 'react';
import { moveToApplied } from '@/app/actions/interviewActions';
import AddFeedbackModal from './AddFeedbackModal';

interface InterviewTableActionsProps {
  candidateId: number;
  interviewId: number;
}

export default function InterviewTableActions({ candidateId, interviewId }: InterviewTableActionsProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center items-center gap-2">
        {/* Button to open the feedback modal */}
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded"
        >
          Add Feedback
        </button>

        {/* Form-based button to cancel the interview */}
        {/* <form action={moveToApplied.bind(null, candidateId)}>
          <button
            type="submit"
            className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-2 rounded"
          >
            Cancel Interview
          </button>
        </form> */}
      </div>

      {/* The modal itself, which will open when the button is clicked */}
      <AddFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        interviewId={interviewId}
      />
    </>
  );
}