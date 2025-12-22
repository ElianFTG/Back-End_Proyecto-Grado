"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryController = void 0;
const CountryServiceContainer_1 = require("../../../shared/service_containers/country/CountryServiceContainer");
class CountryController {
    async getAll(req, res) {
        const countries = await CountryServiceContainer_1.CountryServiceContainer.country.getAll.run();
        return res.status(200).json(countries);
    }
}
exports.CountryController = CountryController;
//# sourceMappingURL=CountryController.js.map