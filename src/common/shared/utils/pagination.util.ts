import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants/pagination.constants';

export function normalizePagination(input: {
  page?: number;
  limit?: number;
}): { page: number; limit: number; skip: number } {
  const page = input.page && input.page > 0 ? input.page : DEFAULT_PAGE;
  const limit =
    input.limit && input.limit > 0 ? Math.min(input.limit, MAX_LIMIT) : DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
