import { GetAllCountries } from "../../../application/country/GetAllCountries";
import { MysqlCountryRepository } from "../../../infrastructure/repositories/MysqlCountryRepository";

const CountryRepository = new MysqlCountryRepository();

export const CountryServiceContainer = {
    country: {
        getAll: new GetAllCountries(CountryRepository),
    }
}
