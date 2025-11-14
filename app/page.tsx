"use client";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import { ModeToggle } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <Unauthenticated>
          <div className="flex flex-col items-center gap-4">
            <p>Logged out</p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </Unauthenticated>
        <Authenticated>
          <div className="flex flex-col items-center gap-4">
            <p>Logged in</p>
          </div>
        </Authenticated>
        <AuthLoading>Loading...</AuthLoading>
        <ModeToggle />
      </div>
    </main>
  );
}
