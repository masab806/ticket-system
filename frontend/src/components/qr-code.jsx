import { cn } from '@/lib/utils'

// Deterministic pseudo-QR rendered from a token string. Visual only.
function hashCells(token, size) {
  const cells = []
  let h = 2166136261
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  for (let i = 0; i < size * size; i++) {
    h ^= i + 0x9e3779b9
    h = Math.imul(h, 16777619)
    cells.push(((h >>> ((i % 24) + 3)) & 1) === 1)
  }
  return cells
}

export function QrCode({ token, className }) {
  const size = 21
  const cells = hashCells(token, size)

  const isFinder = (r, c) => {
    const inBox = (br, bc) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7
    return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0)
  }

  return (
    <div
      className={cn(
        'grid aspect-square w-full rounded-xl bg-white p-3',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="img"
      aria-label="Ticket QR code"
    >
      {cells.map((on, i) => {
        const r = Math.floor(i / size)
        const c = i % size
        const filled = isFinder(r, c) ? finderFill(r, c, size) : on
        return (
          <span
            key={i}
            className={cn('aspect-square', filled ? 'bg-neutral-900' : 'bg-white')}
          />
        )
      })}
    </div>
  )
}

function finderFill(r, c, size) {
  const local = (br, bc) => {
    const rr = r - br
    const cc = c - bc
    if (rr < 0 || rr > 6 || cc < 0 || cc > 6) return null
    const border = rr === 0 || rr === 6 || cc === 0 || cc === 6
    const center = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4
    return border || center
  }
  return (
    local(0, 0) ??
    local(0, size - 7) ??
    local(size - 7, 0) ??
    false
  )
}