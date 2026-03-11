import { Repository, Brackets } from 'typeorm';
import { PresaleEntity } from '../persistence/typeorm/entities/PresaleEntity';
import { PresaleDetailEntity } from '../persistence/typeorm/entities/PresaleDetailEntity';
import { Presale, PresaleDetail, PresaleStatus, PresaleStatusHistory } from '../../domain/presale/Presale';
import { PresaleRepository } from '../../domain/presale/PresaleRepository';
import {
    PresaleFilters,
    PaginatedPresalesResult,
    CreatePresaleDTO,
    UpdatePresaleDTO,
    UpdateDetailDTO,
    ConfirmDeliveryDTO
} from '../../domain/presale/PresaleFilter';
import { AppDataSource } from '../db/Mysql';
import { PresaleDeliveryService } from './MysqlPresaleDeliveryService';
import { PresaleDetailService } from './MysqlPresaleDetailService';

export class MysqlPresaleRepository implements PresaleRepository {
    private readonly presaleRepo: Repository<PresaleEntity>;
    private readonly detailRepo: Repository<PresaleDetailEntity>;
    private readonly deliveryService: PresaleDeliveryService;
    private readonly detailService: PresaleDetailService;

    constructor() {
        this.presaleRepo = AppDataSource.getRepository(PresaleEntity);
        this.detailRepo = AppDataSource.getRepository(PresaleDetailEntity);
        this.deliveryService = new PresaleDeliveryService();
        this.detailService = new PresaleDetailService();
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

    async create(dto: CreatePresaleDTO): Promise<Presale> {

        const subtotal = dto.details.reduce(
            (sum, d) => sum + d.quantityRequested * d.unitPrice,
            0
        );
        const total = subtotal;

        const presaleEntity = this.presaleRepo.create({
            client_id: dto.clientId,
            business_id: dto.businessId ?? null,
            preseller_id: dto.presellerId,
            distributor_id: null,
            branch_id: dto.branchId,
            delivery_date: new Date(dto.deliveryDate),
            status: 'pendiente',
            subtotal,
            total,
            notes: dto.notes ?? null,
            user_id: dto.userId,
            state: true
        });

        const savedPresale = await this.presaleRepo.save(presaleEntity);

        const detailEntities = dto.details.map(d =>
            this.detailRepo.create({
                presale_id: savedPresale.id,
                product_id: d.productId,
                branch_id: dto.branchId,
                quantity_requested: d.quantityRequested,
                quantity_delivered: null,
                price_type_id: d.priceTypeId,
                unit_price: d.unitPrice,
                final_unit_price: null,
                subtotal_requested: d.quantityRequested * d.unitPrice,
                subtotal_delivered: null,
                user_id: dto.userId,
                state: true
            })
        );

        await this.detailRepo.save(detailEntities);

        for (const d of dto.details) {
            if (d.quantityRequested > 0) {
                await this.deliveryService.decrementStock(d.productId, dto.branchId, d.quantityRequested);
            }
        }

        await this.deliveryService.addStatusHistory(
            savedPresale.id,
            'pendiente',
            null,
            'Preventa creada',
            dto.userId
        );

        return this.getById(savedPresale.id) as Promise<Presale>;
    }

    async update(id: number, dto: UpdatePresaleDTO, userId: number): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({
            where: { id, state: true },
            relations: ['details']
        });

        if (!entity) return null;

        if (entity.status !== 'pendiente') {
            throw new Error('Solo se pueden editar preventas en estado pendiente');
        }
        if (dto.clientId !== undefined) entity.client_id = dto.clientId;
        if (dto.businessId !== undefined) entity.business_id = dto.businessId;
        if (dto.branchId !== undefined) entity.branch_id = dto.branchId;
        if (dto.deliveryDate !== undefined) entity.delivery_date = new Date(dto.deliveryDate);
        if (dto.notes !== undefined) entity.notes = dto.notes;
        entity.user_id = userId;

        if (dto.details) {
            if (dto.details.remove && dto.details.remove.length > 0) {
                const toRemove = entity.details.filter(
                    d => dto.details!.remove!.includes(d.id) && d.state
                );
                for (const d of toRemove) {
                    if (d.quantity_requested > 0) {
                        await this.deliveryService.decrementStock(
                            d.product_id,
                            d.branch_id,
                            -d.quantity_requested
                        );
                    }
                    d.state = false;
                    d.user_id = userId;
                    await this.detailRepo.save(d);
                }
            }

            if (dto.details.update && dto.details.update.length > 0) {
                for (const upd of dto.details.update) {
                    const existing = entity.details.find(
                        d => d.id === upd.detailId && d.state
                    );
                    if (!existing) continue;

                    const qtyDiff = upd.quantityRequested - existing.quantity_requested;
                    if (qtyDiff !== 0) {
                        await this.deliveryService.decrementStock(
                            existing.product_id,
                            existing.branch_id,
                            qtyDiff
                        );
                    }

                    existing.quantity_requested = upd.quantityRequested;
                    existing.unit_price = upd.unitPrice;
                    existing.subtotal_requested = upd.quantityRequested * upd.unitPrice;
                    existing.user_id = userId;
                    await this.detailRepo.save(existing);
                }
            }

            if (dto.details.add && dto.details.add.length > 0) {
                const branchId = dto.branchId ?? entity.branch_id;
                const newDetails = dto.details.add.map(d =>
                    this.detailRepo.create({
                        presale_id: id,
                        product_id: d.productId,
                        branch_id: branchId,
                        quantity_requested: d.quantityRequested,
                        quantity_delivered: null,
                        price_type_id: d.priceTypeId,
                        unit_price: d.unitPrice,
                        final_unit_price: null,
                        subtotal_requested: d.quantityRequested * d.unitPrice,
                        subtotal_delivered: null,
                        user_id: userId,
                        state: true
                    })
                );
                await this.detailRepo.save(newDetails);

                for (const d of dto.details.add) {
                    if (d.quantityRequested > 0) {
                        await this.deliveryService.decrementStock(d.productId, branchId, d.quantityRequested);
                    }
                }
            }
        }

        const activeDetails = await this.detailRepo.find({
            where: { presale_id: id, state: true }
        });

        const newSubtotal = activeDetails.reduce(
            (sum, d) => sum + Number(d.subtotal_requested),
            0
        );
        entity.subtotal = newSubtotal;
        entity.total = newSubtotal;

        if (activeDetails.length === 0) {
            throw new Error('La preventa debe tener al menos un producto');
        }

        await this.presaleRepo.save(entity);

        return this.getByIdWithDetails(id);
    }

    async getAll(filters: PresaleFilters): Promise<PaginatedPresalesResult> {
        const page = Math.max(1, filters.page ?? 1);
        const limit = Math.min(100, Math.max(1, filters.limit ?? 10));

        const qb = this.presaleRepo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.client', 'client')
            .leftJoinAndSelect('p.business', 'business')
            .leftJoinAndSelect('p.preseller', 'preseller')
            .leftJoinAndSelect('p.distributor', 'distributor')
            .leftJoinAndSelect('p.branch', 'branch')
            .where('p.state = :state', { state: true });

        this.applyFilters(qb, filters);

        const total = await qb.getCount();

        qb.orderBy('p.delivery_date', 'ASC')
            .addOrderBy('p.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const entities = await qb.getMany();

        return {
            data: entities.map(e => this.mapToDomain(e)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    private applyFilters(
        qb: ReturnType<Repository<PresaleEntity>['createQueryBuilder']>,
        filters: PresaleFilters
    ): void {
        if (filters.status) {
            qb.andWhere('p.status = :status', { status: filters.status });
        }
        if (filters.presellerId) {
            qb.andWhere('p.preseller_id = :presellerId', { presellerId: filters.presellerId });
        }
        if (filters.distributorId) {
            qb.andWhere('p.distributor_id = :distributorId', { distributorId: filters.distributorId });
        }
        if (filters.clientId) {
            qb.andWhere('p.client_id = :clientId', { clientId: filters.clientId });
        }
        if (filters.branchId) {
            qb.andWhere('p.branch_id = :branchId', { branchId: filters.branchId });
        }
        if (filters.deliveryDateFrom) {
            qb.andWhere('p.delivery_date >= :dateFrom', { dateFrom: filters.deliveryDateFrom });
        }
        if (filters.deliveryDateTo) {
            qb.andWhere('p.delivery_date <= :dateTo', { dateTo: filters.deliveryDateTo });
        }
        if (filters.search) {
            const searchTerm = `%${filters.search}%`;
            qb.andWhere(
                new Brackets(sub => {
                    sub.where('client.name LIKE :search', { search: searchTerm })
                        .orWhere('client.last_name LIKE :search', { search: searchTerm })
                        .orWhere('business.name LIKE :search', { search: searchTerm });
                })
            );
        }
    }

    async getById(id: number): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({
            where: { id, state: true },
            relations: ['client', 'business', 'preseller', 'distributor', 'branch']
        });
        return entity ? this.mapToDomain(entity) : null;
    }

    async getByIdWithDetails(id: number): Promise<Presale | null> {
        const entity = await this.presaleRepo.findOne({
            where: { id, state: true },
            relations: ['client', 'business', 'preseller', 'distributor', 'branch']
        });
        if (!entity) return null;

        const presale = this.mapToDomain(entity);
        const detailsWithStock = await this.detailService.getDetailsByPresaleId(id);

        return new Presale(
            presale.clientId,
            presale.presellerId,
            presale.branchId,
            presale.deliveryDate,
            presale.userId,
            presale.businessId,
            presale.distributorId,
            presale.status,
            presale.subtotal,
            presale.total,
            presale.notes,
            presale.deliveryNotes,
            presale.state,
            presale.id,
            presale.createdAt,
            presale.deliveredAt,
            presale.updatedAt,
            presale.clientName,
            presale.clientLastName,
            presale.clientPhone,
            presale.businessName,
            presale.presellerName,
            presale.distributorName,
            presale.branchName,
            detailsWithStock
        );
    }

    async softDelete(id: number, userId: number): Promise<boolean> {
        const entity = await this.presaleRepo.findOne({
            where: { id, state: true },
            relations: ['details']
        });

        if (!entity) return false;

        if (['entregado', 'parcial'].includes(entity.status)) {
            throw new Error('No se puede eliminar una preventa ya entregada');
        }

        entity.state = false;
        entity.user_id = userId;
        await this.presaleRepo.save(entity);

        return true;
    }

    async assignDistributor(id: number, distributorId: number, userId: number): Promise<Presale | null> {
        return this.deliveryService.assignDistributor(id, distributorId, userId);
    }

    async confirmDelivery(id: number, dto: ConfirmDeliveryDTO, userId: number): Promise<Presale | null> {
        return this.deliveryService.confirmDelivery(id, dto, userId, this.getByIdWithDetails.bind(this));
    }

    async cancelPresale(id: number, reason: string | null, userId: number): Promise<Presale | null> {
        return this.deliveryService.cancelPresale(id, reason, userId);
    }

    async canDistributorAccess(presaleId: number, distributorId: number): Promise<boolean> {
        return this.deliveryService.canDistributorAccess(presaleId, distributorId);
    }

    async updateDetail(detailId: number, data: UpdateDetailDTO, userId: number): Promise<PresaleDetail | null> {
        return this.detailService.updateDetail(detailId, data, userId);
    }

    async getDetailsByPresaleId(presaleId: number): Promise<PresaleDetail[]> {
        return this.detailService.getDetailsByPresaleId(presaleId);
    }

    async getStatusHistory(presaleId: number): Promise<PresaleStatusHistory[]> {
        return this.detailService.getStatusHistory(presaleId);
    }
}
