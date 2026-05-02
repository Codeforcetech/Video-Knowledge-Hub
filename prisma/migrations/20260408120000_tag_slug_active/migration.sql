-- AlterTable TagCategory
ALTER TABLE "TagCategory" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "TagCategory" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "TagCategory" SET "slug" = 'platform' WHERE "slug" IS NULL;

ALTER TABLE "TagCategory" ALTER COLUMN "slug" SET NOT NULL;

DROP INDEX IF EXISTS "TagCategory_name_key";

CREATE UNIQUE INDEX "TagCategory_slug_key" ON "TagCategory"("slug");

-- AlterTable TagItem
ALTER TABLE "TagItem" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
