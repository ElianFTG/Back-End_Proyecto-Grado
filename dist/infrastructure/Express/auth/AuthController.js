"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(login) {
        this.login = login;
    }
    async loginHandler(req, res) {
        try {
            const { userName, password } = req.body;
            const result = await this.login.run(userName, password);
            if (!result) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(500).json({ message: "Error en login" });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map