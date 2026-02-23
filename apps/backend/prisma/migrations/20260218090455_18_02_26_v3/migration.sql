-- AddForeignKey
ALTER TABLE "public"."WatchProgress" ADD CONSTRAINT "WatchProgress_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
