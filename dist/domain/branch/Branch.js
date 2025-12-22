"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
class Branch {
    constructor(name, state = true, userId, id) {
        this.id = id;
        this.name = name;
        this.state = state;
        this.userId = userId ?? null;
    }
}
exports.Branch = Branch;
//# sourceMappingURL=Branch.js.map