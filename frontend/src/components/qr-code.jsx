import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

export function QrCode({ token, className }) {
  return (
    <div
      className={cn('aspect-square w-full rounded-xl bg-white p-3', className)}
      role="img"
      aria-label="Ticket QR code"
    >
      <QRCodeSVG value={token} size={196} level="M" className="h-full w-full" />
    </div>
  )
}