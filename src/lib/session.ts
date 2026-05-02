import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const u = session?.user;
  const id = u?.id;
  if (!id) return null;
  return {
    id,
    role: u.role ?? "USER",
    name: u.name,
    email: u.email,
  };
}
