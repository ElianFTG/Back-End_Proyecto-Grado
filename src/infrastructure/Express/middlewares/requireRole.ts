// src/infrastructure/Express/middlewares/requireRole.ts
import { Request, Response, NextFunction } from "express";

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.auth?.role;
    if (!role) return res.status(401).json({ message: "No autenticado" });

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    return next();
  };
};
