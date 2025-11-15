"use client";

import { useAction } from "convex/react";
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
import { api as generatedApi } from "@/convex/_generated/api";

const api: any = generatedApi;

export type ExerciseSearchResult = {
  exerciseId: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
};

type ExerciseSearchProps = {
  onSelect: (exercise: ExerciseSearchResult) => void;
};

export function ExerciseSearch({ onSelect }: ExerciseSearchProps) {
  const searchExercises = useAction(api.exercises.searchExercises);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExerciseSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await searchExercises({
        query: query.trim(),
        muscle: null,
        equipment: null,
      });
      setResults(res);
    } catch (err) {
      setError("Failed to search exercises. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search exercises</CardTitle>
        <CardDescription>
          Powered by ExerciseDB. Tap a result to add it to your template.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. bench press"
            className="text-sm"
          />
          <Button type="submit" disabled={loading} className="sm:w-28">
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
        {results.length > 0 && (
          <ul className="max-h-64 space-y-1 overflow-auto rounded-md border border-border bg-muted/40 p-1 text-xs">
            {results.map((exercise) => (
              <li key={exercise.exerciseId}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start rounded-md px-2 py-1 text-left hover:bg-accent"
                  onClick={() => onSelect(exercise)}
                >
                  <span className="text-xs font-medium">{exercise.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {exercise.bodyPart} · {exercise.target} ·{" "}
                    {exercise.equipment}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {results.length === 0 && !loading && !error && (
          <p className="text-xs text-muted-foreground">
            Results from ExerciseDB will appear here after you search.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
