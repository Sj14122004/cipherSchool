/*
  Warnings:

  - Added the required column `codeSize` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "classCount" INTEGER,
ADD COLUMN     "codeSize" INTEGER NOT NULL,
ADD COLUMN     "meaningfulLines" INTEGER,
ADD COLUMN     "methodCount" INTEGER,
ADD COLUMN     "placeholderCount" INTEGER;
