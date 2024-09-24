-- CreateTable
CREATE TABLE "departments" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repeatability" TEXT,
    "gradingOption" TEXT,
    "concurrentWith" TEXT[],
    "sameAs" TEXT[],
    "restriction" TEXT,
    "overlapsWith" TEXT[],
    "corequisite" TEXT,
    "school" TEXT,
    "units" JSONB NOT NULL,
    "ges" TEXT[],
    "terms" TEXT[],
    "departmentCode" TEXT NOT NULL,
    "prerequisiteTree" JSONB NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "departments"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
