"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryServiceContainer = void 0;
const GetAllCountries_1 = require("../../../application/country/GetAllCountries");
const MysqlCountryRepository_1 = require("../../../infrastructure/repositories/MysqlCountryRepository");
const CountryRepository = new MysqlCountryRepository_1.MysqlCountryRepository();
exports.CountryServiceContainer = {
    country: {
        getAll: new GetAllCountries_1.GetAllCountries(CountryRepository),
    }
};
//# sourceMappingURL=CountryServiceContainer.js.map