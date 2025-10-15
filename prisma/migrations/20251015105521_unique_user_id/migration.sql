/*
  Warnings:

  - You are about to drop the column `email` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `interviewerName` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the `Application` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewerId` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropIndex
DROP INDEX "public"."Candidate_email_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "email",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "interviewerName",
ADD COLUMN     "interviewerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Application";

-- DropTable
DROP TABLE "public"."Job";

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_userId_key" ON "Candidate"("userId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
