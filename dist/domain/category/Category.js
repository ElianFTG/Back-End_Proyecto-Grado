"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
class Category {
    constructor(name, description, userId, state = true, id) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.state = state;
        this.userId = userId;
    }
}
exports.Category = Category;
//# sourceMappingURL=Category.js.map