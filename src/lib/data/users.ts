import { prisma } from "@/lib/prisma";

export type UserOption = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function getActiveUsersForSelect(): Promise<UserOption[]> {
  return prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}
