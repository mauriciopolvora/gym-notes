"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { api as generatedApi } from "@/convex/_generated/api";

const api: any = generatedApi;

export default function CurrentWorkoutPage() {
  const router = useRouter();
  const current = useQuery(api.workouts.getCurrentWorkout, {});

  useEffect(() => {
    if (current === undefined) return;
    if (!current) {
      router.replace("/dashboard");
      return;
    }

    router.replace(`/dashboard/workouts/${current.workout.id}`);
  }, [current, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  );
}
