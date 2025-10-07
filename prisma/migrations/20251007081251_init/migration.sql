/*
  Warnings:

  - A unique constraint covering the columns `[candidateId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "candidateId" TEXT,
ADD COLUMN     "moreInfo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "country" TEXT,
    "responsibilities" TEXT,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" SERIAL NOT NULL,
    "institute" TEXT NOT NULL,
    "degree" TEXT,
    "major" TEXT,
    "fromDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "country" TEXT,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageSkill" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "speaking" TEXT,
    "reading" TEXT,
    "writing" TEXT,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "LanguageSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelMobility" (
    "id" SERIAL NOT NULL,
    "willingToRelocate" TEXT,
    "availabilityForTravel" TEXT,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "TravelMobility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_candidateId_key" ON "Candidate"("candidateId");

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageSkill" ADD CONSTRAINT "LanguageSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelMobility" ADD CONSTRAINT "TravelMobility_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
