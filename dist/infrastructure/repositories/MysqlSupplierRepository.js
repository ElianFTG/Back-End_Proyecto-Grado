"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlSupplierRepository = void 0;
const Supplier_1 = require("../../domain/supplier/Supplier");
const entities_1 = require("../persistence/typeorm/entities");
const Mysql_1 = require("../db/Mysql");
class MysqlSupplierRepository {
    constructor() {
        this.repo = Mysql_1.AppDataSource.getRepository(entities_1.SupplierEntity);
    }
    async getAll() {
        try {
            const rows = await this.repo.find({
                where: { state: true },
                order: { id: "DESC" }
            });
            return rows.map((row) => new Supplier_1.Supplier(row.nit, row.name, row.phone, row.country_id, row.address, row.contact_name, row.state, row.user_id, row.id));
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
    async create(supplier) {
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
            return new Supplier_1.Supplier(row.nit, row.name, row.phone, row.country_id, row.address, row.contact_name, row.state, row.user_id, row.id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async findById(id) {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row)
                return null;
            return new Supplier_1.Supplier(row.nit, row.name, row.phone, row.country_id, row.address, row.contact_name, row.state, row.user_id, row.id);
        }
        catch (error) {
            return null;
        }
    }
    async update(id, supplier, userId) {
        try {
            const patch = {
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
            if (!updatedSupplier)
                return null;
            return new Supplier_1.Supplier(updatedSupplier.nit, updatedSupplier.name, updatedSupplier.phone, updatedSupplier.country_id, updatedSupplier.address, updatedSupplier.contact_name, updatedSupplier.state, updatedSupplier.user_id, updatedSupplier.id);
        }
        catch (error) {
            return null;
        }
    }
    async updateState(id, user_id) {
        try {
            await this.repo.update({ id }, { state: false, user_id });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.MysqlSupplierRepository = MysqlSupplierRepository;
//# sourceMappingURL=MysqlSupplierRepository.js.map