-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Video" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "URL" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "banner" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "genre_id" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Party" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartyMembers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,

    CONSTRAINT "PartyMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Messages" (
    "id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorites" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Party" ADD CONSTRAINT "Party_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyMembers" ADD CONSTRAINT "PartyMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyMembers" ADD CONSTRAINT "PartyMembers_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Messages" ADD CONSTRAINT "Messages_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Messages" ADD CONSTRAINT "Messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorites" ADD CONSTRAINT "Favorites_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
