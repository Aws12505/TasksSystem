// types/ApiResponse.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
  message: string;
}
