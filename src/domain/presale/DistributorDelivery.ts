// ==================== RESPUESTA DE ENTREGAS DEL TRANSPORTISTA ====================

export interface DeliveryProductItem {
    detailId: number;
    productId: number;
    productName: string;
    productBarcode: string | null;
    quantityRequested: number;
    unitPrice: number;
    subtotalRequested: number;
}

export interface DeliveryBusinessInfo {
    businessId: number | null;
    businessName: string | null;
    address: string | null;
    nit: string | null;
    position: string | null;
}

export interface DistributorDeliveryItem {
    presaleId: number;
    status: string;
    notes: string | null;
    clientName: string;
    clientLastName: string;
    clientPhone: string;
    business: DeliveryBusinessInfo;
    products: DeliveryProductItem[];
    subtotal: number;
}
