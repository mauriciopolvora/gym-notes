"use client";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
export default function Home() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground md:px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
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
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await authClient.signOut();
                router.push("/");
              }}
            >
              <Button type="submit">Sign out</Button>
            </form>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </Authenticated>
        <AuthLoading>
          <Spinner />
        </AuthLoading>
        <ModeToggle />
      </div>
    </main>
  );
}
