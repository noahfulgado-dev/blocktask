export default function ClassLoading() {
  return (
    <div className="min-h-dvh">
      <div className="border-b border-border bg-card">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
        <div className="mb-6 space-y-3">
          <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
          <div className="h-6 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, column) => (
              <div
                key={column}
                className="space-y-3 rounded-xl border border-border bg-muted/40 p-3"
              >
                <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
                {Array.from({ length: 2 }).map((_, card) => (
                  <div
                    key={card}
                    className="h-36 animate-pulse rounded-xl border border-border bg-card"
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </main>
    </div>
  );
}
