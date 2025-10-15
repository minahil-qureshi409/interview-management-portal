// app/hr/applications/page.tsx

import { ApplicationsTable } from '@/components/ApplicationsTable';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma'; // Use your global prisma instance

async function getCandidates() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/auth/signin');

  const userRole = session.user.role;
  const userName = session.user.name;

  if (userRole === 'HR_MANAGER') {
    return await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      // --- THIS IS THE FIX ---
      select: {
        id: true,
        firstName: true,
        lastName: true,
        // Select the 'user' relation, and from that user, select their 'email'.
        user: {
          select: {
            email: true,
          }
        },
        title: true,
        status: true,
        createdAt: true,
      },
    });
  }

  if (userRole === 'INTERVIEWER') {
    if (!userName) {
      console.warn("[Data Fetch] Interviewer is missing a name, returning no candidates.");
      return [];
    }
    return await prisma.candidate.findMany({
      where: {
        interviews: {
          some: {
            interviewer: {
              name: userName, // Filter by the related user's name
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      // --- APPLY THE SAME FIX HERE ---
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: {
          select: {
            email: true,
          }
        },
        title: true,
        status: true,
        createdAt: true,
      },
    });
  }
  
  return []; 
}

export default async function ApplicationsPage() {
  const candidates = await getCandidates();

  // We need to flatten the data for the client component
  const flattenedCandidates = candidates.map(c => ({
    ...c,
    email: c.user?.email || 'N/A', // Flatten the user.email into a top-level email property
  }));

  return (
    <div className="container mx-auto p-8 text-black">
      <h1 className="text-3xl font-bold mb-6 text-black">Received Applications</h1>
      <ApplicationsTable candidates={flattenedCandidates} />
    </div>
  );
}

// // This is a Server Component
// export default async function ApplicationsPage() {
//   const candidates = await getCandidates();

//   return (
//     <div className="container mx-auto p-8 text-black">
//       <h1 className="text-3xl font-bold mb-6 text-black">Received Applications</h1>
//       {/* The ApplicationsTable component receives the already-filtered data */}
//       <ApplicationsTable candidates={candidates} />
//     </div>
//   );
// }