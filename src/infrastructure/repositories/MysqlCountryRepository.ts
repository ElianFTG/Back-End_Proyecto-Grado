import { CountryRepository } from "../../domain/country/CountryRepository";
import { Country } from "../../domain/country/Country";
import { Repository } from 'typeorm';
import { CountryEntity } from "../persistence/typeorm/entities";
import { AppDataSource } from "../db/Mysql";

export class MysqlCountryRepository implements CountryRepository {
    private readonly repo: Repository<CountryEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(CountryEntity);
    }

    async getAll(): Promise<Country[]> {
        try {
            const rows = await this.repo.find({ order: { name: "ASC" } });
            return rows.map((row) => new Country(row.name, row.id));
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}
