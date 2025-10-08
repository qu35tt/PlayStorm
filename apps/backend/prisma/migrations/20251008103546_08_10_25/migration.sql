/*
  Warnings:

  - You are about to drop the column `type_id` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `Type` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Type" AS ENUM ('MOVIE', 'SERIES');

-- DropForeignKey
ALTER TABLE "public"."Video" DROP CONSTRAINT "Video_type_id_fkey";

-- AlterTable
ALTER TABLE "public"."Video" DROP COLUMN "type_id",
ADD COLUMN     "type" "public"."Type" NOT NULL DEFAULT 'MOVIE';

-- DropTable
DROP TABLE "public"."Type";
