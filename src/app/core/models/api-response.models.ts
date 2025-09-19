export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}