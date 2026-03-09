import { Presale, PresaleStatus } from './Presale';

export interface PresaleFilters {
    status?: PresaleStatus | undefined;
    presellerId?: number | undefined;
    distributorId?: number | undefined;
    clientId?: number | undefined;
    branchId?: number | undefined;
    deliveryDate?: string | undefined;        // Fecha exacta YYYY-MM-DD
    deliveryDateFrom?: string | undefined;    // Rango desde
    deliveryDateTo?: string | undefined;      // Rango hasta
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}

export interface PaginatedPresalesResult {
    data: Presale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreatePresaleDTO {
    clientId: number;
    businessId?: number | null;
    presellerId: number;
    branchId: number;
    deliveryDate: string;
    notes?: string | null;
    userId: number;
    details: CreatePresaleDetailDTO[];
}

export interface CreatePresaleDetailDTO {
    productId: number;
    productBranchId: number;
    quantityRequested: number;
    priceTypeId: number;
    unitPrice: number;
}

// DTO para editar una preventa (solo campos editables cuando está en estado pending)
export interface UpdatePresaleDTO {
    clientId?: number;
    businessId?: number | null;
    branchId?: number;
    deliveryDate?: string;
    notes?: string | null;
    details?: UpdatePresaleDetailsDTO;
}

export interface UpdatePresaleDetailsDTO {
    // Detalles a actualizar (por id)
    update?: { detailId: number; quantityRequested: number; unitPrice: number }[];
    // Detalles a agregar
    add?: CreatePresaleDetailDTO[];
    // IDs de detalles a eliminar (soft delete)
    remove?: number[];
}

export interface UpdateDetailDTO {
    quantityDelivered: number;
    finalUnitPrice?: number;
}

export interface ConfirmDeliveryDTO {
    deliveryNotes?: string | null;
    details: {
        detailId: number;
        quantityDelivered: number;
        finalUnitPrice?: number;
    }[];
}
