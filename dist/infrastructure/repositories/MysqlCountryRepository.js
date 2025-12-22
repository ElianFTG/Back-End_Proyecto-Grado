"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlCountryRepository = void 0;
const Country_1 = require("../../domain/country/Country");
const entities_1 = require("../persistence/typeorm/entities");
const Mysql_1 = require("../db/Mysql");
class MysqlCountryRepository {
    constructor() {
        this.repo = Mysql_1.AppDataSource.getRepository(entities_1.CountryEntity);
    }
    async getAll() {
        try {
            const rows = await this.repo.find({ order: { name: "ASC" } });
            return rows.map((row) => new Country_1.Country(row.name, row.id));
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
}
exports.MysqlCountryRepository = MysqlCountryRepository;
//# sourceMappingURL=MysqlCountryRepository.js.map