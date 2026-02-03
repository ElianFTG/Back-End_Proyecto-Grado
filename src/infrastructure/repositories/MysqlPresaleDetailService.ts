import { Repository } from 'typeorm';
import { PresaleDetailEntity } from '../persistence/typeorm/entities/PresaleDetailEntity';
import { PresaleStatusHistoryEntity } from '../persistence/typeorm/entities/PresaleStatusHistoryEntity';
import { ProductBranchEntity } from '../persistence/typeorm/entities/ProductBranchEntity';
import { PresaleDetail, PresaleStatus, PresaleStatusHistory } from '../../domain/presale/Presale';
import { UpdateDetailDTO } from '../../domain/presale/PresaleFilter';
import { AppDataSource } from '../db/Mysql';

export class PresaleDetailService {
    private readonly detailRepo: Repository<PresaleDetailEntity>;
    private readonly historyRepo: Repository<PresaleStatusHistoryEntity>;
    private readonly productBranchRepo: Repository<ProductBranchEntity>;

    constructor() {
        this.detailRepo = AppDataSource.getRepository(PresaleDetailEntity);
        this.historyRepo = AppDataSource.getRepository(PresaleStatusHistoryEntity);
        this.productBranchRepo = AppDataSource.getRepository(ProductBranchEntity);
    }
    private mapToDomain(entity: PresaleDetailEntity): PresaleDetail {
        return new PresaleDetail(
            entity.presale_id,
            entity.product_id,
            entity.product_branch_id,
            entity.quantity_requested,
            entity.price_type_id,
            Number(entity.unit_price),
            entity.user_id,
            entity.quantity_delivered,
            entity.final_unit_price ? Number(entity.final_unit_price) : null,
            Number(entity.subtotal_requested),
            entity.subtotal_delivered ? Number(entity.subtotal_delivered) : null,
            entity.state,
            entity.id,
            entity.created_at,
            entity.updated_at,
            entity.product?.name,
            entity.product?.barcode ?? undefined,
            undefined,
            undefined,
            entity.priceType?.name
        );
    }

    private mapToDomainWithStock(entity: PresaleDetailEntity, stockQty: number | null | undefined): PresaleDetail {
        return new PresaleDetail(
            entity.presale_id,
            entity.product_id,
            entity.product_branch_id,
            entity.quantity_requested,
            entity.price_type_id,
            Number(entity.unit_price),
            entity.user_id,
            entity.quantity_delivered,
            entity.final_unit_price ? Number(entity.final_unit_price) : null,
            Number(entity.subtotal_requested),
            entity.subtotal_delivered ? Number(entity.subtotal_delivered) : null,
            entity.state,
            entity.id,
            entity.created_at,
            entity.updated_at,
            entity.product?.name,
            entity.product?.barcode ?? undefined,
            undefined,
            stockQty ?? null,
            entity.priceType?.name
        );
    }

    // ==================== ACTUALIZAR DETALLE ====================
    async updateDetail(detailId: number, data: UpdateDetailDTO, userId: number): Promise<PresaleDetail | null> {
        const detail = await this.detailRepo.findOne({
            where: { id: detailId, state: true },
            relations: ['presale', 'product', 'priceType']
        });

        if (!detail) return null;

        // Solo permitir actualizar si la preventa está en tránsito
        if (detail.presale.status !== 'in_transit') {
            throw new Error('Solo se puede actualizar detalles de preventas en tránsito');
        }

        // REGLA CRÍTICA: No puede aumentar la cantidad
        if (data.quantityDelivered > detail.quantity_requested) {
            throw new Error('No se puede entregar más de lo solicitado');
        }

        detail.quantity_delivered = data.quantityDelivered;
        if (data.finalUnitPrice !== undefined) {
            detail.final_unit_price = data.finalUnitPrice;
        }
        detail.user_id = userId;

        await this.detailRepo.save(detail);
        return this.mapToDomain(detail);
    }

    // ==================== OBTENER DETALLES ====================
    async getDetailsByPresaleId(presaleId: number): Promise<PresaleDetail[]> {
        const details = await this.detailRepo.find({
            where: { presale_id: presaleId, state: true },
            relations: ['product', 'priceType']
        });

        // Obtener stock actual para cada detalle
        const detailsWithStock: PresaleDetail[] = [];

        for (const detail of details) {
            const productBranch = await this.productBranchRepo.findOne({
                where: { product_id: detail.product_id, branch_id: detail.branch_id }
            });

            detailsWithStock.push(this.mapToDomainWithStock(detail, productBranch?.stock_qty));
        }

        return detailsWithStock;
    }

    // ==================== HISTORIAL ====================
    async getStatusHistory(presaleId: number): Promise<PresaleStatusHistory[]> {
        const entities = await this.historyRepo.find({
            where: { presale_id: presaleId },
            order: { created_at: 'DESC' },
            relations: ['user']
        });

        return entities.map(e => new PresaleStatusHistory(
            e.presale_id,
            e.new_status as PresaleStatus,
            e.user_id,
            e.previous_status as PresaleStatus | null,
            e.notes,
            e.id,
            e.created_at
        ));
    }
}
