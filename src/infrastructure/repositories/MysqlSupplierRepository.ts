import { SupplierRepository } from "../../domain/supplier/SupplierRepository";
import { Supplier } from "../../domain/supplier/Supplier";
import { Repository, QueryDeepPartialEntity } from 'typeorm';
import { SupplierEntity } from "../persistence/typeorm/entities";
import { AppDataSource } from "../db/Mysql";

export class MysqlSupplierRepository implements SupplierRepository {
    private readonly repo: Repository<SupplierEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(SupplierEntity);
    }

    async getAll(): Promise<Supplier[]> {
        try {
            const rows = await this.repo.find({
                where: { state: true },
                order: { id: "DESC" }
            });
            return rows.map((row) => new Supplier(
                row.nit,
                row.name,
                row.phone,
                row.country_id,
                row.address,
                row.contact_name,
                row.state,
                row.user_id,
                row.id,
            ));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async create(supplier: Supplier): Promise<Supplier | null> {
        try {
            const row = await this.repo.save({
                nit: supplier.nit,
                name: supplier.name,
                phone: supplier.phone,
                country_id: supplier.countryId,
                address: supplier.address,
                contact_name: supplier.contactName,
                user_id: supplier.userId,
            });
            return new Supplier(
                row.nit,
                row.name,
                row.phone,
                row.country_id,
                row.address,
                row.contact_name,
                row.state,
                row.user_id,
                row.id
            );
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async findById(id: number): Promise<Supplier | null> {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row) return null;
            return new Supplier(
                row.nit,
                row.name,
                row.phone,
                row.country_id,
                row.address,
                row.contact_name,
                row.state,
                row.user_id,
                row.id
            );
        } catch (error) {
            return null;
        }
    }

    async update(id: number, supplier: Partial<Supplier>, userId: number): Promise<Supplier | null> {
        try {
            const patch: QueryDeepPartialEntity<SupplierEntity> = {
                ...(supplier.nit !== undefined ? { nit: supplier.nit } : {}),
                ...(supplier.name !== undefined ? { name: supplier.name } : {}),
                ...(supplier.phone !== undefined ? { phone: supplier.phone } : {}),
                ...(supplier.countryId !== undefined ? { country_id: supplier.countryId } : {}),
                ...(supplier.address !== undefined ? { address: supplier.address } : {}),
                ...(supplier.contactName !== undefined ? { contact_name: supplier.contactName } : {}),
                user_id: userId,
            };
            await this.repo.update({ id }, patch);
            const updatedSupplier = await this.repo.findOneBy({ id });

            if (!updatedSupplier) return null;

            return new Supplier(
                updatedSupplier.nit,
                updatedSupplier.name,
                updatedSupplier.phone,
                updatedSupplier.country_id,
                updatedSupplier.address,
                updatedSupplier.contact_name,
                updatedSupplier.state,
                updatedSupplier.user_id,
                updatedSupplier.id
            );
        } catch (error) {
            return null;
        }
    }

    async updateState(id: number, user_id: number): Promise<void> {
        try {
            await this.repo.update({ id }, { state: false, user_id });
        } catch (error) {
            throw error;
        }
    }
}
