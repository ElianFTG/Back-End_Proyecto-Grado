"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authJwt = void 0;
const authJwt = (authService) => {
    return (req, res, next) => {
        try {
            const header = req.headers.authorization;
            if (!header?.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Token requerido" });
            }
            const token = header.substring("Bearer ".length);
            const payload = authService.verify(token);
            req.auth = {
                userId: payload?.userId,
                role: payload?.role,
            };
            return next();
        }
        catch (err) {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }
    };
};
exports.authJwt = authJwt;
//# sourceMappingURL=authJwt.js.map