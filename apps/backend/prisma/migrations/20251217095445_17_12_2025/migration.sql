-- CreateTable
CREATE TABLE "public"."WatchProgress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "type" "public"."VideoType" NOT NULL,
    "last_position" BIGINT NOT NULL,
    "isFinished" BOOLEAN NOT NULL,

    CONSTRAINT "WatchProgress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WatchProgress" ADD CONSTRAINT "WatchProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WatchProgress" ADD CONSTRAINT "WatchProgress_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "public"."Episode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
