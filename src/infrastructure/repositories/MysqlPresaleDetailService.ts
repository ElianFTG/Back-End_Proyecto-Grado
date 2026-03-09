import { Repository, In } from 'typeorm';
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

    private mapToDomainWithStock(
        entity: PresaleDetailEntity,
        stockQty: number | null | undefined
    ): PresaleDetail {
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
        if (detail.presale.status !== 'in_transit') {
            throw new Error('Solo se puede actualizar detalles de preventas en tránsito');
        }

        // No puede aumentar la cantidad respecto a la solicitada
        if (data.quantityDelivered > detail.quantity_requested) {
            throw new Error('No se puede entregar más de lo solicitado');
        }

        if (data.quantityDelivered < 0) {
            throw new Error('La cantidad entregada no puede ser negativa');
        }

        detail.quantity_delivered = data.quantityDelivered;
        if (data.finalUnitPrice !== undefined) {
            if (data.finalUnitPrice <= 0) {
                throw new Error('El precio final debe ser mayor a 0');
            }
            detail.final_unit_price = data.finalUnitPrice;
        }
        detail.user_id = userId;

        await this.detailRepo.save(detail);
        return this.mapToDomain(detail);
    }

    async getDetailsByPresaleId(presaleId: number): Promise<PresaleDetail[]> {
        const details = await this.detailRepo.find({
            where: { presale_id: presaleId, state: true },
            relations: ['product', 'priceType']
        }) ;
        if (details.length === 0 || !details[0]) return [];
        const branchId = details[0].branch_id;
        const productIds = details.map(d => d.product_id);

        const productBranches = await this.productBranchRepo.find({
            where: {
                product_id: In(productIds),
                branch_id: branchId
            }
        });

        // Mapa product_id -> stock_qty
        const stockMap = new Map<number, number | null>();
        for (const pb of productBranches) {
            stockMap.set(pb.product_id, pb.stock_qty ?? null);
        }

        return details.map(detail =>
            this.mapToDomainWithStock(detail, stockMap.get(detail.product_id))
        );
    }

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