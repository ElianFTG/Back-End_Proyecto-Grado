import { Presale, PresaleDetail, PresaleStatusHistory } from './Presale';
import {
    CreatePresaleDTO,
    PresaleFilters,
    UpdateDetailDTO,
    UpdatePresaleDTO,
    ConfirmDeliveryDTO,
    PaginatedPresalesResult,
    ReturnPresaleProductsDTO,
    ReturnPresaleProductsResult,
    PresaleReportFilters,
    PresaleReportResult
} from './PresaleFilter';
import { DistributorDeliveryItem } from './DistributorDelivery';


export interface PresaleRepository {
    create(dto: CreatePresaleDTO): Promise<Presale>;
    createDirectSale(dto: CreatePresaleDTO): Promise<Presale>;
    update(id: number, dto: UpdatePresaleDTO, userId: number): Promise<Presale | null>;
    getAll(filters: PresaleFilters): Promise<PaginatedPresalesResult>;
    getById(id: number): Promise<Presale | null>;
    getByIdWithDetails(id: number): Promise<Presale | null>;
    assignDistributor(id: number, distributorId: number, userId: number): Promise<Presale | null>;
    confirmDelivery(id: number, dto: ConfirmDeliveryDTO, userId: number): Promise<Presale | null>;
    cancelPresale(id: number, reason: string | null, userId: number): Promise<Presale | null>;
    markAsNotDelivered(id: number, userId: number): Promise<Presale | null>;
    updateDetail(detailId: number, data: UpdateDetailDTO, userId: number): Promise<PresaleDetail | null>;
    getDetailsByPresaleId(presaleId: number): Promise<PresaleDetail[]>;
    getStatusHistory(presaleId: number): Promise<PresaleStatusHistory[]>;
    softDelete(id: number, userId: number): Promise<boolean>;
    canDistributorAccess(presaleId: number, distributorId: number): Promise<boolean>;
    getDeliveriesByDistributor(distributorId: number, deliveryDate: string): Promise<DistributorDeliveryItem[]>;
    returnProducts(id: number, dto: ReturnPresaleProductsDTO, userId: number): Promise<ReturnPresaleProductsResult>;
    findBusinessIdsByDistributorAndDate(distributorId: number, deliveryDate: string): Promise<number[]>;
    getReport(filters: PresaleReportFilters): Promise<PresaleReportResult>;
}