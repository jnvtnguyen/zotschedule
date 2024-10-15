import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { LoginForm } from "@/lib/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";

export const Route = createFileRoute("/auth/login")({
  meta: () => [
    {
      title: "Login",
    },
  ],
  component: Login,
  beforeLoad: async ({ context: { session } }) => {
    if (session.isLoggedIn && session.user) {
      throw redirect({ to: "/" });
    }
  },
});

function Login() {
  return (
    <div className="m-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>
            Enter your information below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/auth/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
