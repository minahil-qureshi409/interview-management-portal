-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_COMPLETED';

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "feedback" TEXT;
