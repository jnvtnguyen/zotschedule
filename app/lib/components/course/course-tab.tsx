import { Link, useLocation } from "@tanstack/react-router";

import { cn } from "@/lib/utils/style";

type CourseTabProps = {
  title: string;
  to: string;
  icon?: React.ReactNode;
};

export function CourseTab({ title, to, icon }: CourseTabProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className="flex-grow md:flex-grow-0 min-w-[calc(100%/3)] border-r last:border-r-0">
      <Link
        to={to}
        className={cn(
          "inline-flex items-center justify-center p-3 border-b-2 border-transparent rounded-t-lg group w-full",
          {
            "border-primary text-primary": isActive,
          },
          "flex-col gap-2 md:flex-row md:gap-0",
        )}
      >
        {icon && <span className="md:me-2 me-0">{icon}</span>}
        {title}
      </Link>
    </li>
  );
}
