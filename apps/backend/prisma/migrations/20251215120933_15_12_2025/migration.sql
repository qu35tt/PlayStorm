/*
  Warnings:

  - You are about to drop the column `URL` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `URL` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Episode" DROP COLUMN "URL";

-- AlterTable
ALTER TABLE "public"."Video" DROP COLUMN "URL";
