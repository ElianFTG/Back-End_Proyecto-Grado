"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCountries = void 0;
class GetAllCountries {
    constructor(repository) {
        this.repository = repository;
    }
    async run() {
        return this.repository.getAll();
    }
}
exports.GetAllCountries = GetAllCountries;
//# sourceMappingURL=GetAllCountries.js.map