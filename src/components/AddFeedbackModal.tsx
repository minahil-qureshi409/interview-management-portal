// components/AddFeedbackModal.tsx

"use client";
import { useState, FormEvent } from 'react';
import { completeInterview } from '@/app/actions/interviewActions';

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: number;
}

export default function AddFeedbackModal({ isOpen, onClose, interviewId }: AddFeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Feedback cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await completeInterview(interviewId, feedback);
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-black">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Interview Feedback</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Enter interviewer feedback here..."
            className="w-full p-2 border rounded-md"
            required
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}