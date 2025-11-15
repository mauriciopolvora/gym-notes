"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
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
import { Spinner } from "@/components/ui/spinner";
import { api as generatedApi } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const api: any = generatedApi;

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workoutId = params.id as Id<"workouts">;

  const detail = useQuery(api.workouts.getWorkoutDetail, { workoutId });
  const updateSet = useMutation(api.workouts.updateWorkoutSet);
  const endWorkout = useMutation(api.workouts.endWorkout);

  const [ending, setEnding] = useState(false);

  if (detail === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <h1 className="text-2xl font-semibold">Workout not found</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const { workout, sets } = detail;
  const isActive = workout.status === "active";

  async function handleEndWorkout() {
    setEnding(true);
    try {
      await endWorkout({ workoutId });
      router.push("/dashboard/workouts");
    } finally {
      setEnding(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-24 pt-4 md:max-w-4xl md:px-6 md:pb-8 md:pt-6">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            {formatWorkoutTitle(workout.startedAt)}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isActive ? "Active workout" : "Completed workout"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Basic numbers for this session. More stats can be added later.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Started</span>
              <span className="font-medium">
                {formatDateTime(workout.startedAt)}
              </span>
            </div>
            {workout.endedAt && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Ended</span>
                <span className="font-medium">
                  {formatDateTime(workout.endedAt)}
                </span>
              </div>
            )}
            {workout.summaryMetrics && (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Volume</span>
                  <span className="font-medium">
                    {Math.round(workout.summaryMetrics.totalVolume)} kg
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Sets</span>
                  <span className="font-medium">
                    {workout.summaryMetrics.totalSets}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Sets</CardTitle>
            <CardDescription>
              Log weights and reps for each set as you go.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sets created for this workout.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sets.map((set: WorkoutSet) => (
                  <WorkoutSetRow
                    key={set.id}
                    set={set}
                    disabled={!isActive}
                    onSave={async (payload) =>
                      updateSet({
                        setId: set.id,
                        reps: payload.reps,
                        weight: payload.weight,
                        rpe: payload.rpe,
                        isCompleted: payload.isCompleted,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isActive && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-4 py-3 shadow-lg md:static md:border-none md:bg-transparent md:px-0 md:py-0 md:shadow-none">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              When you&apos;re done, end the workout to lock in your stats.
            </span>
            <Button
              size="sm"
              className="shrink-0"
              onClick={handleEndWorkout}
              disabled={ending}
            >
              {ending ? "Finishing..." : "End workout"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

type WorkoutSet = {
  id: Id<"workout_sets">;
  exerciseId: string;
  name: string;
  setIndex: number;
  reps: number;
  weight: number;
  rpe?: number;
  isCompleted: boolean;
};

type WorkoutSetRowProps = {
  set: WorkoutSet;
  disabled: boolean;
  onSave: (values: {
    reps: number;
    weight: number;
    rpe: number | null;
    isCompleted: boolean;
  }) => Promise<void>;
};

function WorkoutSetRow({ set, disabled, onSave }: WorkoutSetRowProps) {
  const [reps, setReps] = useState(String(set.reps));
  const [weight, setWeight] = useState(String(set.weight));
  const [rpe, setRpe] = useState(set.rpe !== undefined ? String(set.rpe) : "");
  const [isCompleted, setIsCompleted] = useState(set.isCompleted);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (disabled) return;
    setSaving(true);
    try {
      // When saving, automatically mark the set as completed
      setIsCompleted(true);
      await onSave({
        reps: parseInt(reps || "0", 10) || 0,
        weight: parseFloat(weight || "0") || 0,
        rpe: rpe ? parseFloat(rpe) || null : null,
        isCompleted: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card/60 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{set.name}</span>
          <span className="text-xs text-muted-foreground">
            Set #{set.setIndex + 1}
          </span>
        </div>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            className="h-3 w-3"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
            disabled={disabled}
          />
          <span className="text-muted-foreground">Done</span>
        </label>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Reps</span>
          <Input
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            type="number"
            inputMode="numeric"
            min={0}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Weight</span>
          <Input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            type="number"
            inputMode="decimal"
            min={0}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex w-20 flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">RPE</span>
          <Input
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            type="number"
            inputMode="decimal"
            min={0}
            max={10}
            step={0.5}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
      </div>
      {!disabled && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save set"}
          </Button>
        </div>
      )}
    </div>
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

function formatDateTime(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
