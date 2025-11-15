import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { authComponent } from "./auth";

async function getUserIdOrThrow(
  ctx: Parameters<typeof authComponent.getAuthUser>[0],
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  // Use the auth subject as the stable user identifier
  return identity.subject;
}

const workoutStatusValidator = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("abandoned"),
);

const workoutSummaryValidator = v.object({
  totalVolume: v.number(),
  totalSets: v.number(),
  totalReps: v.number(),
  durationMinutes: v.number(),
});

const serializedWorkoutValidator = v.object({
  id: v.id("workouts"),
  templateId: v.optional(v.id("workout_templates")),
  status: workoutStatusValidator,
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
  notes: v.optional(v.string()),
  summaryMetrics: v.optional(workoutSummaryValidator),
});

const serializedWorkoutSetValidator = v.object({
  id: v.id("workout_sets"),
  workoutId: v.id("workouts"),
  exerciseId: v.string(),
  name: v.string(),
  setIndex: v.number(),
  reps: v.number(),
  weight: v.number(),
  rpe: v.optional(v.number()),
  isCompleted: v.boolean(),
});

function serializeWorkout(doc: any) {
  return {
    id: doc._id,
    templateId: doc.templateId ?? undefined,
    status: doc.status,
    startedAt: doc.startedAt,
    endedAt: doc.endedAt ?? undefined,
    notes: doc.notes ?? undefined,
    summaryMetrics: doc.summaryMetrics ?? undefined,
  };
}

function serializeWorkoutSet(doc: any) {
  return {
    id: doc._id,
    workoutId: doc.workoutId,
    exerciseId: doc.exerciseId,
    name: doc.name,
    setIndex: doc.setIndex,
    reps: doc.reps,
    weight: doc.weight,
    rpe: doc.rpe ?? undefined,
    isCompleted: doc.isCompleted,
  };
}

export const listRecentWorkouts = query({
  args: {
    limit: v.number(),
  },
  returns: v.array(serializedWorkoutValidator),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const limit = Math.max(1, Math.min(args.limit, 50));

    const workouts = await (ctx.db.query("workouts") as any)
      .withIndex("by_user_and_startedAt", (q: any) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return workouts.map(serializeWorkout);
  },
});

export const getWorkoutDetail = query({
  args: {
    workoutId: v.id("workouts"),
  },
  returns: v.union(
    v.null(),
    v.object({
      workout: serializedWorkoutValidator,
      sets: v.array(serializedWorkoutSetValidator),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const workout = await ctx.db.get(args.workoutId);
    if (!workout || workout.userId !== userId) {
      return null;
    }

    const sets = await (ctx.db.query("workout_sets") as any)
      .withIndex("by_workout", (q: any) => q.eq("workoutId", workout._id))
      .order("asc")
      .collect();

    return {
      workout: serializeWorkout(workout),
      sets: sets.map(serializeWorkoutSet),
    };
  },
});

export const getCurrentWorkout = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      workout: serializedWorkoutValidator,
      sets: v.array(serializedWorkoutSetValidator),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getUserIdOrThrow(ctx);

    const [active] = await (ctx.db.query("workouts") as any)
      .withIndex("by_user_and_status", (q: any) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .order("desc")
      .take(1);

    if (!active) {
      return null;
    }

    const sets = await (ctx.db.query("workout_sets") as any)
      .withIndex("by_workout", (q: any) => q.eq("workoutId", active._id))
      .order("asc")
      .collect();

    return {
      workout: serializeWorkout(active),
      sets: sets.map(serializeWorkoutSet),
    };
  },
});

export const startWorkoutFromTemplate = mutation({
  args: {
    templateId: v.id("workout_templates"),
  },
  returns: v.object({
    workoutId: v.id("workouts"),
  }),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    // Ensure the user doesn't already have an active workout.
    const [existing] = await (ctx.db.query("workouts") as any)
      .withIndex("by_user_and_status", (q: any) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .order("desc")
      .take(1);

    if (existing) {
      throw new Error("You already have an active workout");
    }

    const template = await ctx.db.get(args.templateId);
    if (!template || template.userId !== userId) {
      throw new Error("Template not found");
    }

    const now = Date.now();

    const workoutId = await ctx.db.insert("workouts", {
      userId,
      templateId: template._id,
      status: "active",
      startedAt: now,
      endedAt: undefined,
      summaryMetrics: undefined,
      lastUpdatedAt: now,
    });

    // Pre-populate sets from the template.
    let globalSetIndex = 0;
    for (const exercise of template.exercises) {
      for (let i = 0; i < exercise.defaultSets; i += 1) {
        await ctx.db.insert("workout_sets", {
          workoutId,
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          setIndex: globalSetIndex,
          reps: exercise.defaultReps,
          weight: exercise.defaultWeight,
          rpe: undefined,
          isCompleted: false,
        });
        globalSetIndex += 1;
      }
    }

    return { workoutId };
  },
});

export const updateWorkoutSet = mutation({
  args: {
    setId: v.id("workout_sets"),
    reps: v.number(),
    weight: v.number(),
    rpe: v.union(v.number(), v.null()),
    isCompleted: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const setDoc = await ctx.db.get(args.setId);
    if (!setDoc) {
      throw new Error("Set not found");
    }

    const workout = await ctx.db.get(setDoc.workoutId);
    if (!workout || workout.userId !== userId) {
      throw new Error("Workout not found");
    }

    await ctx.db.patch(args.setId, {
      reps: args.reps,
      weight: args.weight,
      rpe: args.rpe ?? undefined,
      isCompleted: args.isCompleted,
    });

    await ctx.db.patch(workout._id, {
      lastUpdatedAt: Date.now(),
    });

    return null;
  },
});

export const endWorkout = mutation({
  args: {
    workoutId: v.id("workouts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const workout = await ctx.db.get(args.workoutId);
    if (!workout || workout.userId !== userId) {
      throw new Error("Workout not found");
    }

    if (workout.status !== "active") {
      throw new Error("Workout is not active");
    }

    const sets = await ctx.db
      .query("workout_sets")
      .withIndex("by_workout", (q: any) => q.eq("workoutId", workout._id))
      .collect();

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    for (const set of sets) {
      totalVolume += set.reps * set.weight;
      totalSets += 1;
      totalReps += set.reps;
    }

    const endedAt = Date.now();
    const durationMinutes =
      workout.startedAt != null
        ? Math.max(0, (endedAt - workout.startedAt) / 60000)
        : 0;

    await ctx.db.patch(workout._id, {
      status: "completed",
      endedAt,
      lastUpdatedAt: endedAt,
      summaryMetrics: {
        totalVolume,
        totalSets,
        totalReps,
        durationMinutes,
      },
    });

    return null;
  },
});
