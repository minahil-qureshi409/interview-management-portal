// app/hr/recruiters/page.tsx

import { prisma } from "@/lib/prisma";
import RoleSelector from "@/components/RoleSelector";
import Image from "next/image";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export default async function RecruitersPage() {
  const users = await getUsers();

  return (
    <div className="p-4 sm:p-8 text-black">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">User</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Email</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-5 py-4 border-b text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <Image
                        className="w-full h-full rounded-full"
                        src={user.image || `https://avatar.vercel.sh/${user.email}`}
                        alt={user.name || 'User avatar'}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold whitespace-no-wrap">{user.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 border-b text-sm">{user.email}</td>
                <td className="px-5 py-4 border-b text-sm">
                  <RoleSelector userId={user.id} currentRole={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}