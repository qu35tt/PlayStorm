-- DropForeignKey
ALTER TABLE "public"."WatchProgress" DROP CONSTRAINT "WatchProgress_episode_id_fkey";

-- AlterTable
ALTER TABLE "public"."WatchProgress" ALTER COLUMN "episode_id" DROP NOT NULL,
ALTER COLUMN "video_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."WatchProgress" ADD CONSTRAINT "WatchProgress_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "public"."Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
