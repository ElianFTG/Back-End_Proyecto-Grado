"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const role = req.auth?.role;
        if (!role)
            return res.status(401).json({ message: "No autenticado" });
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: "No autorizado" });
        }
        return next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=requireRole.js.map