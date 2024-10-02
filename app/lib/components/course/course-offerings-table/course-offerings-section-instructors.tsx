export function CourseOfferingsSectionInstructors({
  instructors,
}: {
  instructors: string[];
}) {
  return (
    <div>
      {instructors.map((instructor) => (
        <div key={instructor}>{instructor}</div>
      ))}
    </div>
  );
}
