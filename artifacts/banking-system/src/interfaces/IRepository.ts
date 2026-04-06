export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRepository<T, CreateDTO, UpdateDTO> {
  findAll(filters?: Record<string, unknown>, pagination?: PaginationOptions): PaginatedResult<T>;
  findById(id: number): T | null;
  create(data: CreateDTO): T;
  update(id: number, data: UpdateDTO): T | null;
  delete(id: number): boolean;
}
