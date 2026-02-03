
import { Repository, Brackets } from 'typeorm';
import { PresaleEntity } from '../persistence/typeorm/entities/PresaleEntity';
import { PresaleDetailEntity } from '../persistence/typeorm/entities/PresaleDetailEntity';
import { Presale, PresaleDetail, PresaleStatus, PresaleStatusHistory } from '../../domain/presale/Presale';
import {
    PresaleRepository,
} from '../../domain/presale/PresaleRepository';
import { PresaleFilters,
    PaginatedPresalesResult,
    CreatePresaleDTO,
    UpdateDetailDTO,
    ConfirmDeliveryDTO} from '../../domain/presale/PresaleFilter';
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

    // ==================== CREAR PREVENTA ====================
    async create(dto: CreatePresaleDTO): Promise<Presale> {
        // Calcular subtotal y total basado en los detalles
        const subtotal = dto.details.reduce((sum, d) => sum + (d.quantityRequested * d.unitPrice), 0);
        const total = subtotal;

        // Crear entidad de preventa
        const presaleEntity = this.presaleRepo.create({
            client_id: dto.clientId,
            business_id: dto.businessId || null,
            preseller_id: dto.presellerId,
            distributor_id: null,
            branch_id: dto.branchId,
            delivery_date: new Date(dto.deliveryDate),
            status: 'pending',
            subtotal,
            total,
            notes: dto.notes || null,
            user_id: dto.userId,
            state: true
        });

        const savedPresale = await this.presaleRepo.save(presaleEntity);

        // Crear detalles
        const detailEntities = dto.details.map(d => this.detailRepo.create({
            presale_id: savedPresale.id,
            product_id: d.productId,
            product_branch_id: d.productBranchId,
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
        }));

        await this.detailRepo.save(detailEntities);

        // Registrar historial inicial
        await this.deliveryService.addStatusHistory(savedPresale.id, 'pending', null, 'Preventa creada', dto.userId);

        // Retornar con relaciones
        return this.getById(savedPresale.id) as Promise<Presale>;
    }

    // ==================== LISTAR PREVENTAS ====================
    async getAll(filters: PresaleFilters): Promise<PaginatedPresalesResult> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;

        const qb = this.presaleRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.client', 'client')
            .leftJoinAndSelect('p.business', 'business')
            .leftJoinAndSelect('p.preseller', 'preseller')
            .leftJoinAndSelect('p.distributor', 'distributor')
            .leftJoinAndSelect('p.branch', 'branch')
            .where('p.state = :state', { state: true });

        // Aplicar filtros
        this.applyFilters(qb, filters);

        // Contar total
        const total = await qb.getCount();

        // Paginar y ordenar
        this.applyPagination(qb, page, limit);

        const entities = await qb.getMany();

        return {
            data: entities.map(e => this.mapToDomain(e)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    private applyFilters(qb: ReturnType<Repository<PresaleEntity>['createQueryBuilder']>, filters: PresaleFilters): void {
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
            qb.andWhere(new Brackets(sub => {
                sub.where('client.name LIKE :search', { search: searchTerm })
                    .orWhere('client.last_name LIKE :search', { search: searchTerm })
                    .orWhere('business.name LIKE :search', { search: searchTerm });
            }));
        }
    }

    private applyPagination(qb: ReturnType<Repository<PresaleEntity>['createQueryBuilder']>, page: number, limit: number): void {
        qb.orderBy('p.delivery_date', 'ASC')
            .addOrderBy('p.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
    }

    // ==================== OBTENER POR ID ====================
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
            relations: ['client', 'business', 'preseller', 'distributor', 'branch', 'details', 'details.product']
        });

        if (!entity) return null;

        const presale = this.mapToDomain(entity);

        // Obtener detalles con stock actual
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

    // ==================== SOFT DELETE ====================
    async softDelete(id: number, userId: number): Promise<boolean> {
        const result = await this.presaleRepo.update(
            { id },
            { state: false, user_id: userId }
        );
        return (result.affected ?? 0) > 0;
    }

    // ==================== DELEGACIÓN A DELIVERY SERVICE ====================
    async assignDistributor(id: number, distributorId: number, userId: number): Promise<Presale | null> {
        return this.deliveryService.assignDistributor(id, distributorId, userId);
    }

    async startDelivery(id: number, userId: number): Promise<Presale | null> {
        return this.deliveryService.startDelivery(id, userId);
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

    // ==================== DELEGACIÓN A DETAIL SERVICE ====================
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
