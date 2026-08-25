export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

/** Mismos defaults/límites que el backend real — ver PaginationQueryExtensions. */
export function clampPagination(
  rawPage: number | null,
  rawPageSize: number | null
): { page: number; pageSize: number } {
  const page = Math.max(1, rawPage ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(MIN_PAGE_SIZE, rawPageSize ?? 10)
  );
  return { page, pageSize };
}

/** Recorta un array en memoria como lo haría el backend con Skip/Take. */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PagedResult<T> {
  const totalCount = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
