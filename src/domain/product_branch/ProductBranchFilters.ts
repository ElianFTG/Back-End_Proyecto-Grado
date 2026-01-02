/**
 * Filtros y paginación para consultas de productos por sucursal
 */
export interface ProductBranchFilters {
    branchId: number;
    search?: string | undefined;
    categoryId?: number | undefined;
    brandId?: number | undefined;
    onlyAvailable?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}

/**
 * Resultado paginado de productos por sucursal
 */
export interface PaginatedBranchProducts<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * DTO para producto con información de sucursal
 */
export interface ProductWithBranchInfo {
    id: number;
    name: string;
    barcode: string | null;
    internalCode: string | null;
    presentationId: number | null;
    colorId: number | null;
    salePrice: Record<string, number>;
    brand: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
    branch: {
        branchId: number;
        hasStock: boolean;
        stockQty: number | null;
    };
}
