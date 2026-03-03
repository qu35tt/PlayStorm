/*
  Warnings:

  - You are about to drop the `Favorites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Favorites" DROP CONSTRAINT "Favorites_video_id_fkey";

-- DropTable
DROP TABLE "Favorites";

-- CreateIndex
CREATE INDEX "WatchProgress_user_id_video_id_idx" ON "WatchProgress"("user_id", "video_id");

-- CreateIndex
CREATE INDEX "WatchProgress_user_id_episode_id_idx" ON "WatchProgress"("user_id", "episode_id");
