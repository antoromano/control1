/*
  Warnings:

  - You are about to drop the column `muscleGroup` on the `exercises` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exercise_logs" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "exercises" DROP COLUMN "muscleGroup",
ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "exercise_muscles" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "exercise_muscles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_muscles_exerciseId_muscleGroup_key" ON "exercise_muscles"("exerciseId", "muscleGroup");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
