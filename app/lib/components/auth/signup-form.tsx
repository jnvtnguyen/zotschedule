import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { hash } from "@node-rs/argon2";
import { Spinner } from "@phosphor-icons/react";

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
import { createSessionForUser } from "@/lib/auth";
import { toast } from "@/lib/hooks/use-toast";

const signupFormSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required." }),
    email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(1, { message: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Please make sure your passwords match.",
    path: ["confirmPassword"],
  });

const signup = createServerFn(
  "POST",
  async (data: z.infer<typeof signupFormSchema>) => {
    const { name, email, password } = data;
    const isDuplicateEmail = await database
      .selectFrom("users")
      .where("email", "=", email)
      .executeTakeFirst();
    if (isDuplicateEmail) {
      return {
        errors: {
          email: "This email is already in use.",
        },
      };
    }
    const user = await database
      .insertInto("users")
      .values({
        name,
        email,
        password: await hash(password),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning(["users.id", "users.name", "users.email"])
      .executeTakeFirstOrThrow();
    return {
      user,
    };
  },
);

export function SignupForm() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    try {
      const result = await signup(data);
      if (result.errors) {
        setErrors(form, result.errors);
        return;
      }
      await createSessionForUser(result.user);
      navigate({ to: "/" });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Something went wrong while trying to sign up.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  placeholder="Create a password"
                  {...field}
                  type="password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Confirm your password"
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
            "Sign up"
          }
        </Button>
      </form>
    </Form>
  );
}
