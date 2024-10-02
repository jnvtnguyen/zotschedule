import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export const setErrors = <T extends FieldValues>(
  form: UseFormReturn<T>,
  errors: Partial<Record<Path<T>, string>>,
) => {
  Object.keys(errors).forEach((key) => {
    form.setError(key as Path<T>, {
      message: errors[key as Path<T>],
    });
  });
};
