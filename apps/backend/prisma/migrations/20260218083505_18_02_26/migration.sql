/*
  Warnings:

  - Added the required column `video_id` to the `WatchProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."WatchProgress" ADD COLUMN     "video_id" TEXT NOT NULL;
