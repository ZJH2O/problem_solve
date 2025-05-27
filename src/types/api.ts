// 统一响应结构
export interface ResponseMessage<T = any> {
  code: number
  data: T
  message?: string
  timestamp?: number
}

// 分页结构
export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 错误类型
export interface RequestError extends Error {
  code?: string
  status?: number
}


export interface LoginResponse {
  message: string;
  code: number;
  data: string; // JWT token
}
