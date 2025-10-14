// app/actions/userActions.ts

"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// This action can only be called by an HR_MANAGER
export async function updateUserRole(userId: string, newRole: Role) {
  try {
    // Optional: Add a check here to ensure the person calling this action is an admin
    // const session = await getServerSession(authOptions);
    // if (session?.user?.role !== 'HR_MANAGER') {
    //   return { success: false, message: "Unauthorized." };
    // }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/hr/recruiters"); // Refresh the user management page
    return { success: true, message: "User role updated successfully." };

  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, message: "Failed to update user role." };
  }
}

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { success: false, message: "All fields are required." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // New users default to CANDIDATE role as per schema
      },
    });

    return { success: true, message: "Account created successfully!" };
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, message: "Something went wrong during registration." };
  }
}