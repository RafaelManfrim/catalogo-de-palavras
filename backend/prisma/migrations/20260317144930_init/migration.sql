-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "words_text_key" ON "words"("text");
