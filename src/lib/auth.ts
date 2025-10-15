// lib/auth.ts

//  helper function makes it easy to get the session anywhere on the server.


import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const getAuthSession = async () => {
  return await getServerSession(authOptions);
};