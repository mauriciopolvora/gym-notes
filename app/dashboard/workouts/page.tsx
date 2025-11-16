"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api as generatedApi } from "@/convex/_generated/api";

const api: any = generatedApi;

export default function WorkoutsPage() {
  const workouts = useQuery(api.workouts.listRecentWorkouts, { limit: 30 });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 md:max-w-4xl md:px-6 md:py-6">
      <div className="flex flex-col gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold">Workouts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View and revisit your past training sessions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>
              Tap any workout to open its detailed log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workouts === undefined ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : workouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No workouts logged yet. Start a workout from the dashboard to
                see it here.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {workouts.map(
                  (w: {
                    id: string;
                    status: "active" | "completed" | "abandoned";
                    startedAt: number;
                  }) => (
                    <li key={w.id} className="py-2 text-sm">
                      <Link
                        href={`/dashboard/workouts/${w.id}`}
                        className="flex flex-col rounded-md px-1 py-1 transition-colors hover:bg-accent"
                      >
                        <span className="font-medium">
                          {formatWorkoutTitle(w.startedAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {w.status === "completed"
                            ? "Completed"
                            : w.status === "active"
                              ? "Active"
                              : "Abandoned"}
                        </span>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function formatWorkoutTitle(startedAt: number) {
  const d = new Date(startedAt);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
