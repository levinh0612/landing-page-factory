-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "file_path" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;
