"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ExerciseSearch } from "@/components/exercise-search";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

type DraftExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  defaultSets: string;
  defaultReps: string;
  defaultWeight: string;
};

export default function CreateNewTemplatePage() {
  const templates = useQuery(api.templates.listTemplates, {});
  const createTemplate = useMutation(api.templates.createTemplate);

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [exercises, setExercises] = useState<DraftExercise[]>([
    makeEmptyExerciseRow(),
  ]);

  const isLoading = templates === undefined;

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const normalizedExercises = exercises
        .filter((ex) => ex.name.trim())
        .map((ex) => ({
          exerciseId: ex.id,
          name: ex.name.trim(),
          targetMuscles: ex.muscleGroup
            ? ex.muscleGroup
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean)
            : [],
          defaultSets: parseInt(ex.defaultSets || "3", 10) || 3,
          defaultReps: parseInt(ex.defaultReps || "8", 10) || 8,
          defaultWeight: parseFloat(ex.defaultWeight || "0") || 0,
        }));

      await createTemplate({
        name: name.trim(),
        notes: notes.trim() || undefined,
        exercises: normalizedExercises,
      });

      setName("");
      setNotes("");
      setExercises([makeEmptyExerciseRow()]);
    } finally {
      setSaving(false);
    }
  }

  function updateExercise(id: string, patch: Partial<DraftExercise>) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)),
    );
  }

  function addExerciseRow() {
    setExercises((prev) => [...prev, makeEmptyExerciseRow()]);
  }

  function removeExerciseRow(id: string) {
    setExercises((prev) =>
      prev.length <= 1 ? prev : prev.filter((ex) => ex.id !== id),
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold">Create new template</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create and manage the templates you use to start workouts quickly.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-6">
            <Card className="order-2 md:order-none">
              <CardHeader>
                <CardTitle>New template</CardTitle>
                <CardDescription>
                  Give your template a name and add the exercises you want to
                  track.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleCreateTemplate}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="template-name"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Template name
                    </label>
                    <Input
                      id="template-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Push day A"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="template-notes"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Notes (optional)
                    </label>
                    <Textarea
                      id="template-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Focus on controlled tempo, 2–3 min rest."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Exercises
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExerciseRow}
                      >
                        Add exercise
                      </Button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="rounded-md border border-border bg-card/40 p-3"
                        >
                          <div className="flex flex-col gap-2">
                            <Input
                              value={exercise.name}
                              onChange={(e) =>
                                updateExercise(exercise.id, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="Exercise name"
                              className="text-sm"
                            />
                            <Input
                              value={exercise.muscleGroup}
                              onChange={(e) =>
                                updateExercise(exercise.id, {
                                  muscleGroup: e.target.value,
                                })
                              }
                              placeholder="Muscle group"
                              className="text-xs"
                            />
                            <div className="flex gap-2">
                              <Input
                                value={exercise.defaultSets}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    defaultSets: e.target.value,
                                  })
                                }
                                type="number"
                                inputMode="numeric"
                                min={1}
                                className="w-20 text-xs"
                                placeholder="Sets"
                              />
                              <Input
                                value={exercise.defaultReps}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    defaultReps: e.target.value,
                                  })
                                }
                                type="number"
                                inputMode="numeric"
                                min={1}
                                className="w-20 text-xs"
                                placeholder="Reps"
                              />
                              <Input
                                value={exercise.defaultWeight}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    defaultWeight: e.target.value,
                                  })
                                }
                                type="number"
                                inputMode="decimal"
                                min={0}
                                className="w-24 text-xs"
                                placeholder="Weight"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-8 w-8 text-xs"
                                onClick={() => removeExerciseRow(exercise.id)}
                                disabled={exercises.length <= 1}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="self-start"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save template"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="order-1 md:order-none">
              <CardHeader>
                <CardTitle>Your templates</CardTitle>
                <CardDescription>
                  Tap a template to review it. Editing and deletion will come
                  next.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templates && templates.length > 0 ? (
                  <ul className="flex flex-col divide-y divide-border">
                    {templates.map((t) => (
                      <li key={t.id} className="py-2 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{t.name}</span>
                          {t.notes && (
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {t.notes}
                            </span>
                          )}
                          <span className="mt-1 text-xs text-muted-foreground">
                            {t.exercisesCount} exercise
                            {t.exercisesCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No templates yet. Use the form to create your first one.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="order-3 md:order-none">
              <ExerciseSearch
                onSelect={(exercise) => {
                  setExercises((prev) => [
                    ...prev,
                    {
                      id: exercise.exerciseId,
                      name: exercise.name,
                      muscleGroup: `${exercise.bodyPart}, ${exercise.target}`,
                      defaultSets: "3",
                      defaultReps: "8",
                      defaultWeight: "0",
                    },
                  ]);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function makeEmptyExerciseRow(): DraftExercise {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    name: "",
    muscleGroup: "",
    defaultSets: "",
    defaultReps: "",
    defaultWeight: "",
  };
}

