"use client";

import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react'; // A popular icon library, install with `npm i lucide-react`

// Define the type for the props we receive from the server component
type CandidateData = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  title: string | null;
  status: string;
  createdAt: Date;
};

interface ApplicationsTableProps {
  candidates: CandidateData[];
}

export function ApplicationsTable({ candidates }: ApplicationsTableProps) {
  const router = useRouter();

  const handleViewProfile = (id: number) => {
    router.push(`/hr/applications/${id}`);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied For</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-gray-50">
              <td className="px-6 py-3 text-sm whitespace-nowrap">{`${candidate.firstName} ${candidate.lastName}`}</td>
              <td className="px-6 py-3 text-sm whitespace-nowrap">{candidate.email}</td>
              <td className="px-6 py-3 text-sm whitespace-nowrap">{candidate.title || 'N/A'}</td>
              <td className="px-6 py-3 text-sm whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  candidate.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' :
                  candidate.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {candidate.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(candidate.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button 
                  onClick={() => handleViewProfile(candidate.id)} 
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}