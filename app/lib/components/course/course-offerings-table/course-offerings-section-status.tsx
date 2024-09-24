import { WebSocSectionStatus } from "@/lib/uci/offerings/types";

export function CourseOfferingsSectionStatus({
  status,
}: {
  status: WebSocSectionStatus;
}) {
  const color = {
    OPEN: "text-green-500",
    Waitl: "text-blue-500",
    FULL: "text-red-500",
    NewOnly: "text-blue-500",
  };

  return <div className={`${color[status]}`}>{status}</div>;
}
