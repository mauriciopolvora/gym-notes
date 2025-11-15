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

export const listTemplates = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("workout_templates"),
      name: v.string(),
      notes: v.optional(v.string()),
      exercisesCount: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getUserIdOrThrow(ctx);

    const templates = await (ctx.db.query("workout_templates") as any)
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    return templates.map((t: any) => ({
      id: t._id,
      name: t.name,
      notes: t.notes,
      exercisesCount: t.exercises.length,
    }));
  },
});

export const getTemplate = query({
  args: {
    templateId: v.id("workout_templates"),
  },
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("workout_templates"),
      name: v.string(),
      notes: v.optional(v.string()),
      exercises: v.array(
        v.object({
          exerciseId: v.string(),
          name: v.string(),
          targetMuscles: v.array(v.string()),
          defaultSets: v.number(),
          defaultReps: v.number(),
          defaultWeight: v.number(),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const template = await ctx.db.get(args.templateId);
    if (!template || template.userId !== userId) {
      return null;
    }

    return {
      id: template._id,
      name: template.name,
      notes: template.notes,
      exercises: template.exercises,
    };
  },
});

const exerciseValidator = v.object({
  exerciseId: v.string(),
  name: v.string(),
  targetMuscles: v.array(v.string()),
  defaultSets: v.number(),
  defaultReps: v.number(),
  defaultWeight: v.number(),
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    notes: v.optional(v.string()),
    exercises: v.array(exerciseValidator),
  },
  returns: v.object({
    id: v.id("workout_templates"),
  }),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const templateId = await ctx.db.insert("workout_templates", {
      userId,
      name: args.name,
      notes: args.notes,
      exercises: args.exercises,
    });

    return { id: templateId };
  },
});

export const updateTemplate = mutation({
  args: {
    templateId: v.id("workout_templates"),
    name: v.optional(v.string()),
    notes: v.optional(v.string()),
    exercises: v.optional(v.array(exerciseValidator)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const existing = await ctx.db.get(args.templateId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Template not found");
    }

    const patch: Partial<typeof existing> = {};
    if (args.name !== undefined) {
      patch.name = args.name;
    }
    if (args.notes !== undefined) {
      patch.notes = args.notes;
    }
    if (args.exercises !== undefined) {
      patch.exercises = args.exercises;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.templateId, patch);
    }

    return null;
  },
});

export const deleteTemplate = mutation({
  args: {
    templateId: v.id("workout_templates"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const existing = await ctx.db.get(args.templateId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Template not found");
    }

    await ctx.db.delete(args.templateId);
    return null;
  },
});
