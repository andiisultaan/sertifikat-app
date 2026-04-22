import { Skeleton } from "@/components/ui/skeleton"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

interface SkeletonTableRowsProps {
  rows?: number
  cols: number
  /** widths per column, e.g. ["w-20","w-40",...] — cycles if shorter than cols */
  widths?: string[]
}

export function SkeletonTableRows({ rows = 5, cols, widths = [] }: SkeletonTableRowsProps) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c} className="px-4 py-3">
              <Skeleton className={`h-4 ${widths[c % widths.length] ?? "w-28"}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
