export default function WorkoutsPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div>
        <h1 className="text-3xl font-bold">Workouts</h1>
        <p className="text-sm text-muted-foreground mt-2">
          View and manage your workout history
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">Workouts list coming soon...</p>
        </div>
      </div>
    </div>
  );
}

