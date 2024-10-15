import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Link } from "@tanstack/react-router";

import { Button } from "@/lib/components/ui/button";

export function NotFound() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="gap-6 flex flex-col max-w-sm">
        <h1 className="text-6xl font-bold">404</h1>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Something's missing.</h2>
          <p className="text">
            This page is missing or you assembled the link incorrectly.
          </p>
        </div>
        <Button asChild>
          <Link to="/">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
