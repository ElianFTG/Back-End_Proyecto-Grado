import { Presale, PresaleStatus } from './Presale';

export interface PresaleFilters {
    status?: PresaleStatus | undefined;
    presellerId?: number | undefined;
    distributorId?: number | undefined;
    clientId?: number | undefined;
    branchId?: number | undefined;
    deliveryDate?: string | undefined;        
    deliveryDateFrom?: string | undefined;    
    deliveryDateTo?: string | undefined;      
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
    presellerId?: number | null;
    branchId: number;
    deliveryDate: string;
    status: string | 'pendiente';
    notes?: string | null;
    userId: number;
    deliveredAt: string | null;
    details: CreatePresaleDetailDTO[];
}

export interface CreatePresaleDetailDTO {
    productId: number;
    quantityRequested: number;
    priceTypeId: number;
    unitPrice: number;
}

export interface UpdatePresaleDTO {
    clientId?: number;
    businessId?: number | null;
    branchId?: number;
    deliveryDate?: string;
    notes?: string | null;
    details?: UpdatePresaleDetailsDTO;
}

export interface UpdatePresaleDetailsDTO {
    update?: { detailId: number; quantityRequested: number; unitPrice: number }[];
    add?: CreatePresaleDetailDTO[];
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

// ==================== DEVOLUCIÓN DE PRODUCTOS ====================

export interface ReturnProductDetailDTO {
    detailId: number;
    quantityToReturn: number;
}

export interface ReturnPresaleProductsDTO {
    notes?: string | null;
    products?: ReturnProductDetailDTO[];
}

export interface ReturnedProductItem {
    detailId: number;
    productId: number;
    productName: string;
    quantityReturned: number;
}

export interface ReturnPresaleProductsResult {
    presaleId: number;
    status: string;
    returnedProducts: ReturnedProductItem[];
    notes: string | null;
}
