import { Repository } from 'typeorm';
import { PresaleEntity } from '../persistence/typeorm/entities/PresaleEntity';
import { PresaleDetailEntity } from '../persistence/typeorm/entities/PresaleDetailEntity';
import { PresaleStatusHistoryEntity } from '../persistence/typeorm/entities/PresaleStatusHistoryEntity';
import { ProductBranchEntity } from '../persistence/typeorm/entities/ProductBranchEntity';
import { Presale, PresaleStatus } from '../../domain/presale/Presale';
import { ConfirmDeliveryDTO } from '../../domain/presale/PresaleFilter';
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
        return new Presale(
            entity.client_id,
            entity.preseller_id,
            entity.branch_id,
            entity.delivery_date,
            entity.user_id,
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
            entity.distributor?.names,
            entity.branch?.name
        );
    }

    
    async assignDistributor(id: number, distributorId: number, userId: number): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({ where: { id, state: true } });

        if (!entity) return null;
        if (entity.status !== 'pending') {
            throw new Error('Solo se puede asignar distribuidor a preventas pendientes');
        }

        const previousStatus = entity.status;
        entity.distributor_id = distributorId;
        entity.status = 'assigned';
        entity.user_id = userId;

        await this.presaleRepo.save(entity);
        await this.addStatusHistory(id, 'assigned', previousStatus, 'Distribuidor asignado', userId);

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
            if (detailUpdate.quantityDelivered > 0) {
                await this.decrementStock(detail.product_id, detail.branch_id, detailUpdate.quantityDelivered);
            }
        }

        const previousStatus = entity.status;
        const newStatus: PresaleStatus = isPartial ? 'partial' : 'delivered';

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
        const entity = await this.presaleRepo.findOne({ where: { id, state: true } });

        if (!entity) return null;
        if (['delivered', 'partial'].includes(entity.status)) {
            throw new Error('No se puede cancelar una preventa ya entregada');
        }

        const previousStatus = entity.status;
        entity.status = 'cancelled';
        entity.user_id = userId;

        await this.presaleRepo.save(entity);
        await this.addStatusHistory(id, 'cancelled', previousStatus, reason, userId);

        return this.getById(id);
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

    private async decrementStock(productId: number, branchId: number, quantity: number): Promise<void> {
        await this.productBranchRepo
            .createQueryBuilder()
            .update(ProductBranchEntity)
            .set({
                stock_qty: () => `stock_qty - ${quantity}`
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
