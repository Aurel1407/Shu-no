// Interface pour les paramètres de pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Classe utilitaire pour gérer la pagination
export class PaginationHelper {
  /**
   * Parse les paramètres de pagination depuis la query string
   */
  static parseParams(query: unknown): PaginationParams {
    // Type guard pour s'assurer que query est un objet
    const queryObj = query && typeof query === 'object' ? (query as Record<string, unknown>) : {};

    const page = Math.max(1, parseInt(String(queryObj.page)) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(queryObj.limit)) || 10)); // Max 100 items par page
    const sortBy = typeof queryObj.sortBy === 'string' ? queryObj.sortBy : 'id';
    const sortOrder =
      typeof queryObj.sortOrder === 'string' && queryObj.sortOrder.toUpperCase() === 'DESC'
        ? 'DESC'
        : 'ASC';
    const search =
      typeof queryObj.search === 'string' ? queryObj.search.trim() || undefined : undefined;

    return {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    };
  }

  /**
   * Calcule les valeurs de pagination
   */
  static calculatePagination(totalItems: number, currentPage: number, itemsPerPage: number) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Calcule l'offset pour la base de données
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Formate la réponse paginée
   */
  static formatResponse<T>(
    data: T[],
    totalItems: number,
    params: PaginationParams
  ): PaginatedResponse<T> {
    const pagination = this.calculatePagination(totalItems, params.page, params.limit);

    return {
      success: true,
      data,
      pagination,
    };
  }
}

// Types pour les options de tri
export type SortableFields =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'email'
  | 'title'
  | 'status'
  | 'price';

// Validation des champs de tri
export class SortValidator {
  private static userFields: SortableFields[] = ['id', 'email', 'createdAt', 'updatedAt'];
  private static productFields: SortableFields[] = [
    'id',
    'name',
    'price',
    'createdAt',
    'updatedAt',
  ];
  private static orderFields: SortableFields[] = ['id', 'status', 'createdAt', 'updatedAt'];
  private static contactFields: SortableFields[] = ['id', 'name', 'email', 'createdAt'];

  static validateUserSort(field: string): boolean {
    return this.userFields.includes(field as SortableFields);
  }

  static validateProductSort(field: string): boolean {
    return this.productFields.includes(field as SortableFields);
  }

  static validateOrderSort(field: string): boolean {
    return this.orderFields.includes(field as SortableFields);
  }

  static validateContactSort(field: string): boolean {
    return this.contactFields.includes(field as SortableFields);
  }
}
