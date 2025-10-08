import { PrismaClient } from '@prisma/client';
import { ApplicationsTable } from '@/components/ApplicationsTable'; 

const prisma = new PrismaClient();

// This function fetches data on the server
async function getCandidates() {
  const candidates = await prisma.candidate.findMany({
    orderBy: {
      createdAt: 'desc', // Show the newest applications first
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      title: true,
      status: true,
      createdAt: true,
    }
  });
  return candidates;
}

// This is a Server Component
export default async function ApplicationsPage() {
  const candidates = await getCandidates();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Received Applications</h1>
      {/* We pass the server-fetched data to a Client Component for interactivity */}
      <ApplicationsTable candidates={candidates} />
    </div>
  );
}