import { Presale, PresaleStatus } from './Presale';
export interface PresaleFilters {
    status?: PresaleStatus | undefined;
    presellerId?: number | undefined;
    distributorId?: number | undefined;
    clientId?: number | undefined;
    branchId?: number | undefined;
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

