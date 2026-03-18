-- AlterTable
ALTER TABLE "words"
ADD COLUMN "phonetic" TEXT,
ADD COLUMN "audio_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
