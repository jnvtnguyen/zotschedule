-- CreateEnum
CREATE TYPE "CustomScheduleEventRepeatability" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'WEEKDAY', 'MONTHLY', 'CUSTOM');

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
    "concurrent_with" TEXT[],
    "grading_option" TEXT,
    "same_as" TEXT[],
    "restriction" TEXT,
    "overlaps_with" TEXT[],
    "corequisite" TEXT,
    "school" TEXT,
    "units" JSONB NOT NULL,
    "ges" TEXT[],
    "terms" TEXT[],
    "department_code" TEXT NOT NULL,
    "prerequisite_tree" JSONB NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "term_calendars" (
    "term" TEXT NOT NULL,
    "schedule_of_classes_available" TIMESTAMP(3) NOT NULL,
    "instruction_begins" TIMESTAMP(3) NOT NULL,
    "instruction_ends" TIMESTAMP(3) NOT NULL,
    "finals_begin" TIMESTAMP(3) NOT NULL,
    "finals_end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "term_calendars_pkey" PRIMARY KEY ("term")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "google_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "picture" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL,
    "show_weekends" BOOLEAN NOT NULL,
    "view" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_schedule_events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "schedule_id" TEXT NOT NULL,
    "section_code" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "declined" TIMESTAMPTZ[],

    CONSTRAINT "course_schedule_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_schedule_events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "schedule_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL,
    "color" TEXT NOT NULL,
    "repeatability" "CustomScheduleEventRepeatability" NOT NULL,
    "recurrence" JSONB,

    CONSTRAINT "custom_schedule_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_aliases" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "alias" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "search_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_code_fkey" FOREIGN KEY ("department_code") REFERENCES "departments"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_schedule_events" ADD CONSTRAINT "course_schedule_events_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_schedule_events" ADD CONSTRAINT "custom_schedule_events_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
