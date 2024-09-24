type CourseOfferingsSectionRestrictionsProps = {
  restrictions: string[];
};

export function CourseOfferingsSectionRestrictions({
  restrictions,
}: CourseOfferingsSectionRestrictionsProps) {
  const getRestrictionsText = (restrictions: string[]): string => {
    if (restrictions.length === 0) {
      return "None";
    }
    if (restrictions.length === 1) {
      return restrictions[0];
    }
    return (
      restrictions.slice(0, -1).join(", ") +
      " and " +
      restrictions[restrictions.length - 1]
    );
  };

  return (
    <div className="flex flex-row">
      <p>{getRestrictionsText(restrictions)}</p>
    </div>
  );
}
