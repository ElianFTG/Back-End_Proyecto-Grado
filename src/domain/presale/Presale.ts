export type PresaleStatus = 'pendiente' | 'asignado' | 'entregado' | 'parcial' | 'cancelado';

export class Presale {
    id?: number | undefined;
    clientId: number;
    businessId: number | null;
    presellerId: number | null;
    distributorId: number | null;
    branchId: number;
    deliveryDate: Date;
    deliveredAt: Date | null;
    status: PresaleStatus;
    subtotal: number;
    total: number;
    notes: string | null;
    deliveryNotes: string | null;
    userId: number;
    state: boolean;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    clientName?: string | undefined;
    clientLastName?: string | undefined;
    clientPhone?: string | undefined;
    businessName?: string | undefined;
    presellerName?: string | undefined;
    distributorName?: string | undefined;
    branchName?: string | undefined;
    details?: PresaleDetail[] | undefined;

    constructor(
        clientId: number,
        branchId: number,
        deliveryDate: Date,
        userId: number,
        presellerId: number | null,
        businessId: number | null = null,
        distributorId: number | null = null,
        status: PresaleStatus = 'pendiente',
        subtotal: number = 0,
        total: number = 0,
        notes: string | null = null,
        deliveryNotes: string | null = null,
        state: boolean = true,
        id?: number,
        createdAt?: Date,
        deliveredAt: Date | null = null,
        updatedAt?: Date,
        clientName?: string,
        clientLastName?: string,
        clientPhone?: string,
        businessName?: string,
        presellerName?: string,
        distributorName?: string,
        branchName?: string,
        details?: PresaleDetail[]
    ) {
        this.id = id;
        this.clientId = clientId;
        this.businessId = businessId;
        this.presellerId = presellerId;
        this.distributorId = distributorId;
        this.branchId = branchId;
        this.deliveryDate = deliveryDate;
        this.deliveredAt = deliveredAt;
        this.status = status;
        this.subtotal = subtotal;
        this.total = total;
        this.notes = notes;
        this.deliveryNotes = deliveryNotes;
        this.userId = userId;
        this.state = state;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.clientName = clientName;
        this.clientLastName = clientLastName;
        this.clientPhone = clientPhone;
        this.businessName = businessName;
        this.presellerName = presellerName;
        this.distributorName = distributorName;
        this.branchName = branchName;
        this.details = details;
    }
}


export class PresaleDetail {
    id?: number | undefined;
    presaleId: number;
    productId: number;
    branchId?: number | undefined;
    quantityRequested: number;
    quantityDelivered: number | null;
    priceTypeId: number;
    priceTypeName?: string | undefined;
    unitPrice: number;
    finalUnitPrice: number | null;
    subtotalRequested: number;
    subtotalDelivered: number | null;
    userId: number;
    state: boolean;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    productName?: string | undefined;
    productBarcode?: string | undefined;
    branchName?: string | undefined;
    currentStock?: number | null | undefined;

    constructor(
        presaleId: number,
        productId: number,
        quantityRequested: number,
        priceTypeId: number,
        unitPrice: number,
        userId: number,
        quantityDelivered: number | null = null,
        finalUnitPrice: number | null = null,
        subtotalRequested?: number,
        subtotalDelivered: number | null = null,
        state: boolean = true,
        id?: number,
        createdAt?: Date,
        updatedAt?: Date,
        productName?: string,
        productBarcode?: string,
        branchName?: string,
        currentStock?: number | null,
        priceTypeName?: string
    ) {
        this.id = id;
        this.presaleId = presaleId;
        this.productId = productId;
        this.quantityRequested = quantityRequested;
        this.quantityDelivered = quantityDelivered;
        this.priceTypeId = priceTypeId;
        this.priceTypeName = priceTypeName;
        this.unitPrice = unitPrice;
        this.finalUnitPrice = finalUnitPrice;
        this.subtotalRequested = subtotalRequested ?? (quantityRequested * unitPrice);
        this.subtotalDelivered = subtotalDelivered;
        this.userId = userId;
        this.state = state;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.productName = productName;
        this.productBarcode = productBarcode;
        this.branchName = branchName;
        this.currentStock = currentStock;
    }
}

export class PresaleStatusHistory {
    id?: number | undefined;
    presaleId: number;
    previousStatus: PresaleStatus | null;
    newStatus: PresaleStatus;
    notes: string | null;
    userId: number;
    createdAt?: Date | undefined;

    constructor(
        presaleId: number,
        newStatus: PresaleStatus,
        userId: number,
        previousStatus: PresaleStatus | null = null,
        notes: string | null = null,
        id?: number,
        createdAt?: Date
    ) {
        this.id = id;
        this.presaleId = presaleId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.notes = notes;
        this.userId = userId;
        this.createdAt = createdAt;
    }
}
