import { WebSocEnrollment } from "@/lib/uci/offerings/types";

type CourseOfferingsSectionEnrollmentProps = {
  enrollment: WebSocEnrollment;
};

export function CourseOfferingsSectionEnrollment({
  enrollment,
}: CourseOfferingsSectionEnrollmentProps) {
  const waitlist =
    enrollment.waitlist === "n/a"
      ? "N/A"
      : `${enrollment.waitlist} / ${enrollment.waitlistCapacity}`;

  return (
    <div>
      <p className="font-semibold">
        {enrollment.current} / {enrollment.max}
      </p>
      <p>WL: {waitlist}</p>
    </div>
  );
}
