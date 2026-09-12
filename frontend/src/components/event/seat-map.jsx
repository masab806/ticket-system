import { cn } from '@/lib/utils'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLS = 12

// deterministic "taken" pattern so it renders identically each time
function isTaken(rowIndex, col) {
  return (rowIndex * 7 + col * 3) % 5 === 0
}

export function buildSeats(selected) {
  const seats = []
  ROWS.forEach((row, r) => {
    for (let c = 1; c <= COLS; c++) {
      const id = `${row}${c}`
      seats.push({
        id,
        row,
        num: c,
        status: selected.has(id)
          ? 'selected'
          : isTaken(r, c)
            ? 'taken'
            : 'available',
      })
    }
  })
  return seats
}

export function SeatMap({ selected, onToggle }) {
  const seats = buildSeats(selected)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mx-auto mb-6 w-full max-w-md rounded-lg bg-gradient-to-r from-primary/15 to-brand-2/15 py-2 text-center text-xs font-medium uppercase tracking-widest text-primary">
        Stage
      </div>

      <div className="flex flex-col items-center gap-2">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-4 text-xs font-medium text-muted-foreground">{row}</span>
            <div className="flex gap-1.5">
              {seats
                .filter((s) => s.row === row)
                .map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.status === 'taken'}
                    onClick={() => onToggle(seat.id)}
                    aria-label={`Seat ${seat.id} ${seat.status}`}
                    className={cn(
                      'size-6 rounded-md text-[0px] transition-all sm:size-7',
                      seat.status === 'available' &&
                        'bg-accent hover:scale-110 hover:bg-primary/40',
                      seat.status === 'selected' &&
                        'bg-primary ring-2 ring-primary/30',
                      seat.status === 'taken' && 'cursor-not-allowed bg-muted opacity-60',
                    )}
                  >
                    {seat.id}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded bg-accent" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded bg-primary" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded bg-muted opacity-60" /> Taken
        </span>
      </div>
    </div>
  )
}

export default SeatMap