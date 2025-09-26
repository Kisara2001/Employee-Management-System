import { Request } from 'express';

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
  sort?: Record<string, 1 | -1>;
};

export function getPagination(req: Request): Pagination {
  const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = ((req.query.sortOrder as string) || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  return { page, limit, skip, sort: { [sortBy]: sortOrder as 1 | -1 } };
}

export function buildMeta(total: number, page: number, limit: number) {
  const pages = Math.ceil(total / limit) || 1;
  return { total, page, limit, pages };
}

