type PaginationItem = number | "ellipsis";

/**
 * Creates an array of numbers in a specified range.
 *
 * @param {number} start - The starting number of the range.
 * @param {number} end - The ending number of the range.
 *
 * @returns {number[]} An array of numbers from start to end.
 */
const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

/**
 * Gets the visible pages for pagination.
 *
 * @param {number} currentPage - The current page number.
 * @param {number} totalPages - The total number of pages.
 *
 * @returns {number[]} An array of visible page numbers.
 */
export const getVisiblePages = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  const leftSiblingIndex = Math.max(currentPage - 1, 1);
  const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2 && totalPages > 5;
  const shouldShowRightEllipsis =
    rightSiblingIndex < totalPages - 2 && totalPages > 5;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3;
    const leftRange = range(1, leftItemCount + 2);

    return [...leftRange, "ellipsis", totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3;
    const rightRange = range(totalPages - rightItemCount - 1, totalPages);

    return [firstPageIndex, "ellipsis", ...rightRange];
  }

  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);

    return [
      firstPageIndex,
      "ellipsis",
      ...middleRange,
      "ellipsis",
      lastPageIndex,
    ];
  }

  return range(1, totalPages);
};
