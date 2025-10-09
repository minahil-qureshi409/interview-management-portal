-- CreateTable
CREATE TABLE "Interview" (
    "id" SERIAL NOT NULL,
    "interviewDate" TIMESTAMP(3) NOT NULL,
    "interviewType" TEXT NOT NULL,
    "interviewerName" TEXT NOT NULL,
    "meetLink" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
