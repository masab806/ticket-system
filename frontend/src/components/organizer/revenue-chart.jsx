import { formatUsd } from '@/lib/mock-data'
export function RevenueChart({data}) {
  const max = Math.max(...data.map((m) => m.revenue))

  return (
    <div>
      <div className="flex items-end gap-3 sm:gap-5">
        {data.map((m, i) => {
          const pct = Math.round((m.revenue / max) * 100)
          const isLast = i === data.length - 1
          return (
            <div key={`${m.month}-${i}`} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {formatUsd(m.revenue)}
              </span>
              <div className="flex h-40 w-full items-end">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    isLast
                      ? 'bg-gradient-to-t from-primary to-brand-2'
                      : 'bg-accent'
                  }`}
                  style={{ height: `${pct}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-xs text-muted-foreground">{m.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}