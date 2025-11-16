/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const currentWorkout = useQuery(api.workouts.getCurrentWorkout, {});
  const recentWorkouts = useQuery(api.workouts.listRecentWorkouts, {
    limit: 4,
  });
  const templates = useQuery(api.templates.listTemplates, {});
  const startWorkoutFromTemplate = useMutation(
    api.workouts.startWorkoutFromTemplate,
  );

  const isLoading =
    authLoading ||
    !isAuthenticated ||
    currentWorkout === undefined ||
    recentWorkouts === undefined ||
    templates === undefined;

  async function handleStartWorkout() {
    if (!selectedTemplateId) return;
    const result = await startWorkoutFromTemplate({
      templateId: selectedTemplateId as any,
    });
    router.push(`/dashboard/workouts/${result.workoutId}`);
  }

  async function handleQuickStart(templateId: string) {
    setSelectedTemplateId(templateId);
    const result = await startWorkoutFromTemplate({
      templateId: templateId as any,
    });
    router.push(`/dashboard/workouts/${result.workoutId}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Start a new workout or resume your current session.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <Card className="order-1 md:order-none">
              <CardHeader>
                <CardTitle>Start workout</CardTitle>
                <CardDescription>
                  Pick a template and begin logging your sets.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {templates && (templates as any[]).length > 0 ? (
                  <>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-s font-medium text-muted-foreground">
                        Workout template
                      </span>
                      <Select
                        value={selectedTemplateId || undefined}
                        onValueChange={(value) => setSelectedTemplateId(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {(templates as any[]).map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}{" "}
                              {t.exercisesCount > 0
                                ? `(${t.exercisesCount} exercises)`
                                : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleStartWorkout}
                      disabled={!selectedTemplateId}
                      className="w-full md:w-auto"
                    >
                      Start workout
                    </Button>
                    {(templates as any[]).length > 0 && (
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-s font-medium text-muted-foreground">
                          Quick start
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(templates as any[]).slice(0, 4).map((t: any) => (
                            <Button
                              key={`quick-${t.id}`}
                              type="button"
                              variant={
                                selectedTemplateId === t.id
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="text-xs"
                              onClick={() => handleQuickStart(t.id)}
                            >
                              {t.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t have any templates yet.{" "}
                    <Button
                      variant="link"
                      className="h-auto p-0 align-baseline"
                      onClick={() => router.push("/dashboard/create-template")}
                    >
                      Create your first template
                    </Button>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="order-3 md:order-none">
              <CardHeader>
                <CardTitle>Recent workouts</CardTitle>
                <CardDescription>
                  Last few sessions you&apos;ve logged.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {recentWorkouts && (recentWorkouts as any[]).length > 0 ? (
                  <>
                    <ul className="flex flex-col divide-y divide-border">
                      {(recentWorkouts as any[]).map((w: any) => (
                        <li key={w.id} className="text-sm">
                          <button
                            type="button"
                            className="flex w-full flex-col items-start rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/80 hover:text-accent-foreground"
                            onClick={() =>
                              router.push(`/dashboard/workouts/${w.id}`)
                            }
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
                          </button>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 self-start"
                      onClick={() => router.push("/dashboard/workouts")}
                    >
                      View all workouts
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No workouts logged yet. Start a workout to see it here.
                  </p>
                )}
              </CardContent>
            </Card>

            {currentWorkout && (
              <Card className="order-2 md:order-none">
                <CardHeader>
                  <CardTitle>Current workout</CardTitle>
                  <CardDescription>
                    You have an active session in progress.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">
                      Started at {formatTime(currentWorkout.workout.startedAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Finish your sets and end the workout when you&apos;re
                      done.
                    </span>
                  </div>
                  <Button
                    className="w-full md:w-auto"
                    onClick={() =>
                      router.push(
                        `/dashboard/workouts/${currentWorkout.workout.id}`,
                      )
                    }
                  >
                    Resume current workout
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Small utility card for quick notes (optional, mobile-friendly) */}
            <Card className="order-4 md:order-none">
              <CardHeader>
                <CardTitle>Quick note</CardTitle>
                <CardDescription>
                  Jot down something to remember about today&apos;s training.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Input
                  placeholder="e.g. Focus on form for squats today"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Notes aren&apos;t saved yet &mdash; this is just a UI
                  placeholder for future features.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

function formatWorkoutTitle(startedAt: number) {
  const d = new Date(startedAt);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
