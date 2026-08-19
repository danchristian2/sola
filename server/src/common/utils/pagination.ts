import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export function parsePagination(query: { page?: unknown; limit?: unknown }) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginatedResult<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit) || 1)
    }
  };
}
