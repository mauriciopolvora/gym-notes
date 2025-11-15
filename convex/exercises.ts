"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import type { authComponent } from "./auth";

async function ensureAuthenticated(
  ctx: Parameters<typeof authComponent.getAuthUser>[0],
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
}

type RawExercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
};

type SearchResponse = {
  success: true;
  metadata: {
    totalExercises: number;
    totalPages: number;
    currentPage: number;
    previousPage: string | null;
    nextPage: string | null;
  };
  data: RawExercise[];
};

export const searchExercises = action({
  args: {
    query: v.string(),
    // kept for API stability; currently unused by the third‑party API
    muscle: v.union(v.string(), v.null()),
    equipment: v.union(v.string(), v.null()),
  },
  returns: v.array(
    v.object({
      exerciseId: v.string(),
      name: v.string(),
      bodyPart: v.string(),
      target: v.string(),
      equipment: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    await ensureAuthenticated(ctx);

    const params = new URLSearchParams();
    params.set("q", args.query);
    params.set("offset", "0");
    params.set("limit", "10");
    params.set("threshold", "0.3");

    const url = `https://exercisedb-api.vercel.app/api/v1/exercises/search?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Exercise search failed with status ${res.status}`);
    }

    const data = (await res.json()) as SearchResponse;
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error("Unexpected ExerciseDB response shape");
    }

    // Save raw exercises into cache table if they are not already present.
    await Promise.all(
      data.data.map((item) =>
        ctx.runMutation(internal.exercise_cache.saveExerciseIfMissing, {
          exerciseId: item.exerciseId,
          name: item.name,
          gifUrl: item.gifUrl,
          targetMuscles: item.targetMuscles,
          bodyParts: item.bodyParts,
          equipments: item.equipments,
          secondaryMuscles: item.secondaryMuscles,
          instructions: item.instructions,
        }),
      ),
    );

    const normalized = data.data
      .map((item) => {
        const bodyPart = item.bodyParts[0];
        const target = item.targetMuscles[0];
        const equipment = item.equipments[0];

        if (
          !item.exerciseId ||
          !item.name ||
          !bodyPart ||
          !target ||
          !equipment
        ) {
          return null;
        }

        return {
          exerciseId: item.exerciseId,
          name: item.name,
          bodyPart,
          target,
          equipment,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return normalized;
  },
});
