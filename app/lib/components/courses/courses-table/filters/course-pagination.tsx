import { Table } from "@tanstack/react-table";

import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/lib/components/ui/pagination";
import { getVisiblePages } from "@/lib/utils/pagination";

type CoursePaginationProps<TData> = {
  table: Table<TData>;
};

export function CoursePagination<TData>({
  table,
}: CoursePaginationProps<TData>) {
  const pages = getVisiblePages(
    table.getState().pagination.pageIndex + 1,
    table.getPageCount(),
  );

  if (pages.length === 0) {
    return null;
  }

  return (
    <Pagination className="m-0 sm:justify-start justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={table.previousPage} />
        </PaginationItem>
        {pages.map((page, i) => (
          <PaginationItem key={`pagination-item-${i}`}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationButton
                onClick={() => table.setPageIndex(page - 1)}
                isActive={table.getState().pagination.pageIndex + 1 === page}
              >
                {page}
              </PaginationButton>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext onClick={table.nextPage} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
