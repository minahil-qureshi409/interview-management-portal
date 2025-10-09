// components/ScheduleInterviewModal.tsx

"use client";

import { useState, FormEvent } from 'react';
import { scheduleInterview } from '@/app/actions/interviewActions';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: number;
}

export default function ScheduleInterviewModal({ isOpen, onClose, candidateId }: ScheduleInterviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for form fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Technical Screening');
  const [interviewer, setInterviewer] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!date || !time || !interviewer) {
      setError("Date, Time, and Interviewer are required.");
      setIsSubmitting(false);
      return;
    }

    // Combine date and time into a single Date object
    const interviewDate = new Date(`${date}T${time}`);

    const result = await scheduleInterview(candidateId, {
      interviewDate,
      interviewType: type,
      interviewerName: interviewer,
      meetLink,
      notes,
    });
    
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message); // Or use a more elegant toast notification
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-2xl font-bold mb-4">Schedule Interview</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
              <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Interview Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Technical Screening</option>
              <option>HR Round</option>
              <option>Managerial Round</option>
              <option>Final Round</option>
            </select>
          </div>
          <div>
            <label htmlFor="interviewer" className="block text-sm font-medium text-gray-700">Interviewer Name</label>
            <input type="text" id="interviewer" placeholder="e.g., John Doe" value={interviewer} onChange={(e) => setInterviewer(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
          </div>
          <div>
            <label htmlFor="meetLink" className="block text-sm font-medium text-gray-700">Meeting Link (Optional)</label>
            <input type="url" id="meetLink" placeholder="https://meet.google.com/..." value={meetLink} onChange={(e) => setMeetLink(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Scheduling...' : 'Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}