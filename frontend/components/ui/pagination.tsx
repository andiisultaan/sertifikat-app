import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  lastPage: number;
  total?: number;
  perPage?: number;
  onPageChange: (page: number) => void;
}

function getPageRange(page: number, lastPage: number): (number | 'ellipsis')[] {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];

  if (page > 3) pages.push('ellipsis');

  const start = Math.max(2, page - 1);
  const end   = Math.min(lastPage - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (page < lastPage - 2) pages.push('ellipsis');

  pages.push(lastPage);
  return pages;
}

export function Pagination({ page, lastPage, total, perPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = getPageRange(page, lastPage);

  const from = perPage ? (page - 1) * perPage + 1 : undefined;
  const to   = perPage && total ? Math.min(page * perPage, total) : undefined;

  return (
    <div className="px-4 py-3 border-t flex items-center justify-between gap-2">
      {total !== undefined && perPage !== undefined ? (
        <span className="text-xs text-muted-foreground">
          Menampilkan {from}–{to} dari {total} data
        </span>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="flex size-8 items-center justify-center text-muted-foreground">
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => onPageChange(p)}
              aria-label={`Halaman ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === lastPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
