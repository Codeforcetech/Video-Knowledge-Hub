import Link from "next/link";
import { updateUserAdmin } from "@/actions/admin-users";
import { prisma } from "@/lib/prisma";
import { buttonPrimarySm, fieldInput, linkMuted } from "@/lib/ui";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className={linkMuted}>
          ← トップ
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          ユーザー管理
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          表示名・権限・有効/無効を変更できます。
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#2A2A2A] bg-[#181818]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-xs text-[#A1A1AA]">
              <th className="px-4 py-3 font-medium">メール</th>
              <th className="px-4 py-3 font-medium">編集</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-[#2A2A2A] last:border-0"
              >
                <td className="whitespace-nowrap px-4 py-3 text-[#A1A1AA]">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <form
                    action={updateUserAdmin.bind(null, u.id)}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <input
                        name="name"
                        type="text"
                        defaultValue={u.name ?? ""}
                        placeholder="表示名"
                        className={`${fieldInput} py-2 text-sm`}
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <select name="role" defaultValue={u.role} className={`${fieldInput} py-2 text-sm`}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div className="w-full sm:w-36">
                      <select
                        name="isActive"
                        defaultValue={u.isActive ? "true" : "false"}
                        className={`${fieldInput} py-2 text-sm`}
                      >
                        <option value="true">有効</option>
                        <option value="false">無効</option>
                      </select>
                    </div>
                    <button type="submit" className={buttonPrimarySm}>
                      保存
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
