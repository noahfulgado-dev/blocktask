export default function DashboardLoading() {
  return (
    <div className="min-h-dvh">
      <div className="border-b border-border bg-card">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_240px] lg:items-start xl:grid-cols-[320px_minmax(0,1fr)_270px] 2xl:grid-cols-[360px_minmax(0,1fr)_300px]">
          <div className="order-3 h-[480px] animate-pulse rounded-xl border border-border bg-card md:col-start-1 md:row-span-2 md:row-start-1 lg:order-1 lg:row-span-1" />

          <div className="order-2 grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4 md:col-start-2 md:row-start-1 lg:order-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>

          <div className="order-1 h-40 animate-pulse rounded-xl border border-border bg-card md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1" />
        </div>
      </main>
    </div>
  );
}
