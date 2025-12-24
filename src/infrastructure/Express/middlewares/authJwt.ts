// src/infrastructure/Express/middlewares/authJwt.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../../domain/auth/AuthService";

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId?: number;
                role?: string;
            };
        }
    }
}

export const authJwt = (authService: AuthService) => {
    return (req: Request, res: Response, next: NextFunction) => {
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
        } catch (err) {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }
    };
};
