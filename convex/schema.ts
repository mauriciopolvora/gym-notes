import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Stores reusable workout blueprints per user.
  workout_templates: defineTable({
    userId: v.string(),
    name: v.string(),
    notes: v.optional(v.string()),
    exercises: v.array(
      v.object({
        exerciseId: v.string(), // ID from ExerciseDB or internal identifier
        name: v.string(),
        targetMuscles: v.array(v.string()),
        defaultSets: v.number(),
        defaultReps: v.number(),
        defaultWeight: v.number(),
      }),
    ),
  }).index("by_user", ["userId"]),

  // Individual logged workout sessions, including in-progress ones.
  workouts: defineTable({
    userId: v.string(),
    templateId: v.optional(v.id("workout_templates")),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned"),
    ),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    summaryMetrics: v.optional(
      v.object({
        totalVolume: v.number(),
        totalSets: v.number(),
        totalReps: v.number(),
        durationMinutes: v.number(),
      }),
    ),
    lastUpdatedAt: v.number(),
  })
    .index("by_user_and_status", ["userId", "status", "startedAt"])
    .index("by_user_and_startedAt", ["userId", "startedAt"]),

  // Per-set data for each workout.
  workout_sets: defineTable({
    workoutId: v.id("workouts"),
    exerciseId: v.string(),
    name: v.string(),
    setIndex: v.number(),
    reps: v.number(),
    weight: v.number(),
    rpe: v.optional(v.number()),
    isCompleted: v.boolean(),
  }).index("by_workout", ["workoutId", "setIndex"]),

  // Cache of ExerciseDB exercises by ID so we can avoid repeat API calls later.
  exercise_search_cache: defineTable({
    exerciseId: v.string(),
    name: v.string(),
    gifUrl: v.string(),
    targetMuscles: v.array(v.string()),
    bodyParts: v.array(v.string()),
    equipments: v.array(v.string()),
    secondaryMuscles: v.array(v.string()),
    instructions: v.array(v.string()),
  }).index("by_exerciseId", ["exerciseId"]),
});
