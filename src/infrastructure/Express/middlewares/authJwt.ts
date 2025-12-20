import { Request, Response, NextFunction } from "express";
import { JwtAuthService } from "../../services/JwtAuthService";

const jwtService = new JwtAuthService();

export function authJwt(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwtService.verify(token);
    (req as any).auth = payload; // { sub, userName, role, iat, exp }
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}
