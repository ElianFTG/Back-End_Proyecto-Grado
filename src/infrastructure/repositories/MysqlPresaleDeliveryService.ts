import { Repository } from 'typeorm';
import { PresaleEntity } from '../persistence/typeorm/entities/PresaleEntity';
import { PresaleDetailEntity } from '../persistence/typeorm/entities/PresaleDetailEntity';
import { PresaleStatusHistoryEntity } from '../persistence/typeorm/entities/PresaleStatusHistoryEntity';
import { ProductBranchEntity } from '../persistence/typeorm/entities/ProductBranchEntity';
import { Presale, PresaleStatus } from '../../domain/presale/Presale';
import {
    ConfirmDeliveryDTO,
    ReturnPresaleProductsDTO,
    ReturnPresaleProductsResult
} from '../../domain/presale/PresaleFilter';
import { AppDataSource } from '../db/Mysql';

export class PresaleDeliveryService {
    private readonly presaleRepo: Repository<PresaleEntity>;
    private readonly detailRepo: Repository<PresaleDetailEntity>;
    private readonly historyRepo: Repository<PresaleStatusHistoryEntity>;
    private readonly productBranchRepo: Repository<ProductBranchEntity>;

    constructor() {
        this.presaleRepo = AppDataSource.getRepository(PresaleEntity);
        this.detailRepo = AppDataSource.getRepository(PresaleDetailEntity);
        this.historyRepo = AppDataSource.getRepository(PresaleStatusHistoryEntity);
        this.productBranchRepo = AppDataSource.getRepository(ProductBranchEntity);
    }

    private mapToDomain(entity: PresaleEntity): Presale {
        const distributorFullName = entity.distributor
            ? [
                entity.distributor.names,
                entity.distributor.last_name,
                entity.distributor.second_last_name
            ].filter(Boolean).join(' ')
            : undefined;

        return new Presale(
            entity.client_id,
            entity.branch_id,
            entity.delivery_date,
            entity.user_id,
            entity.preseller_id,
            entity.business_id,
            entity.distributor_id,
            entity.status as PresaleStatus,
            Number(entity.subtotal),
            Number(entity.total),
            entity.notes,
            entity.delivery_notes,
            entity.state,
            entity.id,
            entity.created_at,
            entity.delivered_at,
            entity.updated_at,
            entity.client?.name,
            entity.client?.last_name,
            entity.client?.phone,
            entity.business?.name,
            entity.preseller?.names,
            distributorFullName,
            entity.branch?.name
        );
    }

    async assignDistributor(id: number, distributorId: number, userId: number): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({ where: { id, state: true } });

        if (!entity) return null;
        if (entity.status !== 'pendiente') {
            throw new Error('Solo se puede asignar distribuidor a preventas pendientes');
        }

        const previousStatus = entity.status;
        entity.distributor_id = distributorId;
        entity.status = 'asignado';
        entity.user_id = userId;

        await this.presaleRepo.save(entity);
        await this.addStatusHistory(id, 'asignado', previousStatus, 'Distribuidor asignado', userId);

        return this.getById(id);
    }

    async confirmDelivery(
        id: number,
        dto: ConfirmDeliveryDTO,
        userId: number,
        getByIdWithDetails: (id: number) => Promise<Presale | null>
    ): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({
            where: { id, state: true },
            relations: ['details']
        });

        if (!entity) return null;

        let totalDelivered = 0;
        let isPartial = false;

        for (const detailUpdate of dto.details) {
            const detail = entity.details.find(d => d.id === detailUpdate.detailId && d.state);
            if (!detail) continue;
            if (detailUpdate.quantityDelivered > detail.quantity_requested) {
                throw new Error(`No se puede entregar más de lo solicitado para el producto ${detail.product_id}`);
            }
            if (detailUpdate.quantityDelivered < detail.quantity_requested) {
                isPartial = true;
            }

            const finalPrice = detailUpdate.finalUnitPrice ?? Number(detail.unit_price);
            const subtotalDelivered = detailUpdate.quantityDelivered * finalPrice;

            detail.quantity_delivered = detailUpdate.quantityDelivered;
            detail.final_unit_price = finalPrice;
            detail.subtotal_delivered = subtotalDelivered;
            detail.user_id = userId;

            await this.detailRepo.save(detail);

            totalDelivered += subtotalDelivered;
        }

        const previousStatus = entity.status;
        const newStatus: PresaleStatus = isPartial ? 'parcial' : 'entregado';

        entity.status = newStatus;
        entity.delivered_at = new Date();
        entity.delivery_notes = dto.deliveryNotes || null;
        entity.total = totalDelivered;
        entity.user_id = userId;

        await this.presaleRepo.save(entity);
        await this.addStatusHistory(
            id,
            newStatus,
            previousStatus,
            isPartial ? 'Entrega parcial completada' : 'Entrega completa',
            userId
        );

        return getByIdWithDetails(id);
    }

    async cancelPresale(id: number, reason: string | null, userId: number): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({
            where: { id, state: true },
            relations: ['details']
        });

        if (!entity) return null;
        if (['entregado', 'parcial'].includes(entity.status)) {
            throw new Error('No se puede cancelar una preventa ya entregada');
        }

        if (['cancelado'].includes(entity.status)) {
            throw new Error('Esta preventa ya se encuentra cancelada');
        }

        const activeDetails = entity.details.filter(d => d.state);

        for (const detail of activeDetails) {
            if (detail.quantity_requested > 0) {
                await this.incrementStock(detail.product_id, detail.branch_id, detail.quantity_requested);
            }
        }

        const previousStatus = entity.status;
        entity.status = 'cancelado';
        entity.user_id = userId;

        await this.presaleRepo.save(entity);
        await this.addStatusHistory(id, 'cancelado', previousStatus, reason, userId);

        return this.getById(id);
    }

    async returnProducts(
        presaleId: number,
        dto: ReturnPresaleProductsDTO,
        userId: number
    ): Promise<ReturnPresaleProductsResult> {
        const entity = await this.presaleRepo.findOne({
            where: { id: presaleId, state: true },
            relations: ['details', 'details.product']
        });

        if (!entity) throw new Error('Preventa no encontrada');

        if (!['parcial', 'cancelado'].includes(entity.status)) {
            throw new Error(
                'Solo se pueden devolver productos de preventas en estado parcial o cancelado'
            );
        }

        const alreadyReturned = await this.historyRepo.findOne({
            where: { presale_id: presaleId, new_status: 'devuelto' }
        });
        if (alreadyReturned) {
            throw new Error('Los productos de esta preventa ya fueron devueltos al stock');
        }

        const activeDetails = entity.details.filter(d => d.state);
        const returnedProducts = [];

        for (const detail of activeDetails) {
            const delivered = detail.quantity_delivered ?? 0;
            const maxReturnable = detail.quantity_requested - delivered;

            if (maxReturnable <= 0) continue;

            const override = dto.products?.find(p => p.detailId === detail.id);

            if (dto.products && !override) {
                continue;
            }

            const toReturn = override ? override.quantityToReturn : maxReturnable;

            if (toReturn <= 0) continue;

            if (toReturn > maxReturnable) {
                throw new Error(
                    `La cantidad a devolver (${toReturn}) para el detalle ${detail.id} supera ` +
                    `el máximo devolvible (${maxReturnable})`
                );
            }

            await this.incrementStock(detail.product_id, detail.branch_id, toReturn);
            returnedProducts.push({
                detailId: detail.id,
                productId: detail.product_id,
                productName: detail.product?.name ?? '',
                quantityReturned: toReturn
            });
        }

        await this.addStatusHistory(
            presaleId,
            'devuelto',
            entity.status,
            dto.notes ?? 'Devolución de productos al stock',
            userId
        );

        return {
            presaleId,
            status: entity.status,
            returnedProducts,
            notes: dto.notes ?? null
        };
    }

    async canDistributorAccess(presaleId: number, distributorId: number): Promise<boolean> {
        const entity = await this.presaleRepo.findOne({
            where: { id: presaleId, distributor_id: distributorId, state: true }
        });
        return entity !== null;
    }

    private async getById(id: number): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({
            where: { id, state: true },
            relations: ['client', 'business', 'preseller', 'distributor', 'branch']
        });
        return entity ? this.mapToDomain(entity) : null;
    }

    async decrementStock(productId: number, branchId: number, quantity: number): Promise<void> {
        await this.productBranchRepo
            .createQueryBuilder()
            .update(ProductBranchEntity)
            .set({
                stock_qty: () => `GREATEST(0, stock_qty - ${quantity})`
            })
            .where('product_id = :productId AND branch_id = :branchId', {
                productId,
                branchId
            })
            .execute();
    }

    async incrementStock(productId: number, branchId: number, quantity: number): Promise<void> {
        await this.productBranchRepo
            .createQueryBuilder()
            .update(ProductBranchEntity)
            .set({
                stock_qty: () => `stock_qty + ${quantity}`
            })
            .where('product_id = :productId AND branch_id = :branchId', {
                productId,
                branchId
            })
            .execute();
    }

    async addStatusHistory(
        presaleId: number,
        newStatus: string,
        previousStatus: string | null,
        notes: string | null,
        userId: number
    ): Promise<void> {
        const entity = this.historyRepo.create({
            presale_id: presaleId,
            previous_status: previousStatus,
            new_status: newStatus,
            notes,
            user_id: userId
        });
        await this.historyRepo.save(entity);
    }
}