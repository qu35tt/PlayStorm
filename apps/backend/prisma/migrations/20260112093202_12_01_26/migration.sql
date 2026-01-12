/*
  Warnings:

  - The primary key for the `Genre` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Genre` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `genre_id` on the `Video` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Video" DROP CONSTRAINT "Video_genre_id_fkey";

-- AlterTable
ALTER TABLE "public"."Genre" DROP CONSTRAINT "Genre_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Genre_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Video" DROP COLUMN "genre_id",
ADD COLUMN     "genre_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
