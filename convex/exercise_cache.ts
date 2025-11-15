import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const saveExerciseIfMissing = internalMutation({
  args: {
    exerciseId: v.string(),
    name: v.string(),
    gifUrl: v.string(),
    targetMuscles: v.array(v.string()),
    bodyParts: v.array(v.string()),
    equipments: v.array(v.string()),
    secondaryMuscles: v.array(v.string()),
    instructions: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("exercise_search_cache")
      .withIndex("by_exerciseId", (q) => q.eq("exerciseId", args.exerciseId))
      .unique();

    if (!existing) {
      await ctx.db.insert("exercise_search_cache", {
        exerciseId: args.exerciseId,
        name: args.name,
        gifUrl: args.gifUrl,
        targetMuscles: args.targetMuscles,
        bodyParts: args.bodyParts,
        equipments: args.equipments,
        secondaryMuscles: args.secondaryMuscles,
        instructions: args.instructions,
      });
    }

    return null;
  },
});
