import { z } from "zod";
import { createServerFn } from "@tanstack/start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { getEvent, setResponseStatus } from "vinxi/http";

import { Schedule } from "@/lib/database/types";
import { database } from "@/lib/database";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/components/ui/form";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { setErrors } from "@/lib/utils/form";
import { useToast } from "@/lib/hooks/use-toast";
import { useAuthUser } from "@/lib/hooks/use-auth-user";

type CreateScheduleFormProps = {
  onScheduleCreate: (schedule: Schedule) => void;
  onCancel?: () => void;
};

const createScheduleFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
});

const createSchedule = createServerFn(
  "POST",
  async ({
    data,
    userId,
  }: {
    data: z.infer<typeof createScheduleFormSchema>;
    userId: string;
  }) => {
    const event = getEvent();
    const { name } = data;
    const isDuplicateName = await database
      .selectFrom("schedules")
      .where("name", "=", name)
      .where("userId", "=", userId)
      .executeTakeFirst();
    if (isDuplicateName) {
      setResponseStatus(event, 400);
      return {
        errors: {
          name: "This name is already in use.",
        },
      };
    }
    await database
      .updateTable("schedules")
      .where("userId", "=", userId)
      .set({ isDefault: false })
      .execute();
    const schedule = await database
      .insertInto("schedules")
      .values({ name, userId, isDefault: true, showWeekends: true, view: "timeGridWeek" })
      .returningAll()
      .executeTakeFirstOrThrow();
    return {
      schedule,
    };
  },
);

export function CreateScheduleForm({
  onScheduleCreate,
  onCancel,
}: CreateScheduleFormProps) {
  const queryClient = useQueryClient();
  const user = useAuthUser((state) => state.user);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createScheduleFormSchema>>({
    resolver: zodResolver(createScheduleFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof createScheduleFormSchema>) => {
    try {
      const result = await createSchedule({
        data,
        userId: user.id,
      });
      if (result.errors) {
        setErrors(form, result.errors);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["schedules", user.id],
      });
      onScheduleCreate(result.schedule);
      toast({
        description: "Your schedule has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description:
          "Something went wrong while creating your schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the name of the schedule"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={() => onCancel()}>
              Cancel
            </Button>
          )}
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Form>
  );
}
