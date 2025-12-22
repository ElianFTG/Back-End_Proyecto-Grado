"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supplier = void 0;
class Supplier {
    constructor(nit, name, phone, countryId, address, contactName, state = true, userId = null, id) {
        this.id = id;
        this.nit = nit;
        this.name = name;
        this.phone = phone;
        this.countryId = countryId;
        this.address = address;
        this.contactName = contactName;
        this.state = state;
        this.userId = userId;
    }
}
exports.Supplier = Supplier;
//# sourceMappingURL=Supplier.js.map