import { Country } from "./Country";

export interface CountryRepository {
    getAll(): Promise<Country[]>;
}
