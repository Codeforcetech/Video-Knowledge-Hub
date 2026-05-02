import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

const categories: {
  slug: string;
  name: string;
  sortOrder: number;
  items: string[];
}[] = [
  {
    slug: "industry",
    name: "業種",
    sortOrder: 0,
    items: ["小売", "飲食", "美容・ヘルス", "不動産", "人材"],
  },
  {
    slug: "purpose",
    name: "用途",
    sortOrder: 1,
    items: ["認知", "訴求", "CV", "採用", "ブランディング"],
  },
  {
    slug: "atmosphere",
    name: "雰囲気",
    sortOrder: 2,
    items: ["ポップ", "高級感", "カジュアル", "シネマティック", "ミニマル"],
  },
  {
    slug: "direction",
    name: "演出",
    sortOrder: 3,
    items: ["テロップ多め", "ナレーション", "実写メイン", "モーション多め"],
  },
  {
    slug: "platform",
    name: "媒体",
    sortOrder: 4,
    items: ["YouTube", "TikTok", "Instagram", "X", "その他"],
  },
  {
    slug: "orientation",
    name: "縦横",
    sortOrder: 5,
    items: ["横動画", "縦動画", "スクエア"],
  },
  {
    slug: "duration",
    name: "尺",
    sortOrder: 6,
    items: ["15秒以内", "30秒前後", "60秒前後", "3分以上"],
  },
];

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "password";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: { name: "Creator", isActive: true },
    create: {
      name: "Creator",
      email: "creator@example.com",
      passwordHash: await bcrypt.hash("password", 10),
      role: UserRole.USER,
      isActive: true,
    },
  });

  for (const c of categories) {
    const cat = await prisma.tagCategory.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        sortOrder: c.sortOrder,
        isActive: true,
      },
      create: {
        slug: c.slug,
        name: c.name,
        sortOrder: c.sortOrder,
        isActive: true,
      },
    });

    for (let i = 0; i < c.items.length; i++) {
      const name = c.items[i];
      await prisma.tagItem.upsert({
        where: { categoryId_name: { categoryId: cat.id, name } },
        update: { sortOrder: i, isActive: true },
        create: {
          categoryId: cat.id,
          name,
          sortOrder: i,
          isActive: true,
        },
      });
    }
  }

  console.log("Seeded:", { admin: admin.email, adminPassword });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
