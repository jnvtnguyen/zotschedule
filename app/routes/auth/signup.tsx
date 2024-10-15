import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { SignupForm } from "@/lib/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";

export const Route = createFileRoute("/auth/signup")({
  meta: () => [
    {
      title: "Sign up",
    },
  ],
  component: Signup,
  beforeLoad: async ({ context: { session } }) => {
    if (session.isLoggedIn && session.user) {
      throw redirect({ to: "/" });
    }
  },
});

function Signup() {
  return (
    <div className="mx-auto max-w-sm mt-56">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sign up</CardTitle>
          <CardDescription>
            Enter your information below to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
