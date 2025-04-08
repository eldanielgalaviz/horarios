// Tipos comunes y utilitarios para toda la aplicación

// Tipo para respuestas con paginación
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  // Tipo para respuestas de error de la API
  export interface ApiError {
    statusCode: number;
    message: string | string[];
    error?: string;
  }
  
  // Opciones para ordenamiento
  export type SortDirection = 'asc' | 'desc';
  
  export interface SortOptions {
    field: string;
    direction: SortDirection;
  }
  
  // Opciones para filtrado
  export interface FilterOptions {
    [key: string]: string | number | boolean | null | undefined;
  }
  
  // Opciones para paginación
  export interface PaginationOptions {
    page: number;
    limit: number;
  }
  
  // Opciones combinadas para consultas
  export interface QueryOptions {
    pagination?: PaginationOptions;
    sort?: SortOptions;
    filters?: FilterOptions;
  }