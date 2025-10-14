// components/RoleSelector.tsx

"use client";

import { Role } from "@prisma/client";
import { useState } from "react";
import { updateUserRole } from "@/app/actions/userActions";

interface RoleSelectorProps {
  userId: string;
  currentRole: Role;
}

export default function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const [role, setRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setIsLoading(true);
    
    const result = await updateUserRole(userId, newRole);
    
    if (result.success) {
      setRole(newRole);
    } else {
      alert(result.message); // Show an error
      // Revert the select dropdown to the original role on failure
      e.target.value = role;
    }
    setIsLoading(false);
  };

  return (
    <select
      value={role}
      onChange={handleRoleChange}
      disabled={isLoading}
      className={`p-2 border rounded-md ${isLoading ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
    >
      <option value={Role.CANDIDATE}>Candidate</option>
      <option value={Role.INTERVIEWER}>Interviewer</option>
      <option value={Role.HR_MANAGER}>HR Manager</option>
    </select>
  );
}