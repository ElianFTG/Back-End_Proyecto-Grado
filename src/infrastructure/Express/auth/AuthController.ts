import { Request, Response } from "express";
import { Login } from "../../../application/auth/Login";

export class AuthController {
  constructor(private login: Login) {}

  async loginHandler(req: Request, res: Response) {
    try {
      const { userName, password } = req.body;

      const result = await this.login.run(userName, password);

      if (!result) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ message: "Error en login" });
    }
  }
}
