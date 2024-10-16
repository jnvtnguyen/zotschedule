import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { getEvent, setResponseStatus } from "vinxi/http";
import { verify } from "@node-rs/argon2";
import { Spinner } from "@phosphor-icons/react";

import { database } from "@/lib/database";
import { createSessionForUser } from "@/lib/auth";
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
import { toast } from "@/lib/hooks/use-toast";

const loginFormSchema = z.object({
  email: z.string().min(1, { message: "Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const login = createServerFn(
  "POST",
  async (data: z.infer<typeof loginFormSchema>) => {
    const event = getEvent();
    const { email, password } = data;
    const user = await database
      .selectFrom("users")
      .select(["users.id", "users.name", "users.email", "users.password"])
      .where("email", "=", email)
      .executeTakeFirst();
    if (!user) {
      setResponseStatus(event, 401);
      return {
        errors: {
          password: "Invalid email or password.",
        },
      };
    }
    if (!(await verify(user.password, password))) {
      setResponseStatus(event, 401);
      return {
        errors: {
          password: "Invalid email or password.",
        },
      };
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },
);

export function LoginForm() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    try {
      const result = await login(data);
      if (result.errors) {
        setErrors(form, result.errors);
        return;
      }
      await createSessionForUser(result.user);
      navigate({ to: "/" });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description:
          "Something went wrong while trying to log in. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  {...field}
                  type="password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {form.formState.isSubmitting ?
            <Spinner className="animate-spin w-5 h-5" /> :
            "Log in"
          }
        </Button>
      </form>
    </Form>
  );
}
