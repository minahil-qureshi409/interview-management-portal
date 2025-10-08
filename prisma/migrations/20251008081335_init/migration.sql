-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'REJECTED', 'HIRED');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "skills" TEXT,
    "experience" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "candidateId" TEXT,
    "title" TEXT,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "moreInfo" TEXT,
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
