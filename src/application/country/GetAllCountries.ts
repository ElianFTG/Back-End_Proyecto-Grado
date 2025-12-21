import { Country } from "../../domain/country/Country";
import { CountryRepository } from "../../domain/country/CountryRepository";

export class GetAllCountries {
    constructor(private repository: CountryRepository) {}

    async run(): Promise<Country[]> {
        return this.repository.getAll();
    }
}
