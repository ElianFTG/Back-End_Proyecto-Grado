"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtAuthService {
    constructor() {
        this.secret = process.env.JWT_SECRET || "dev_secret_change_me";
        this.expiresInSeconds = Number(process.env.JWT_EXPIRES_IN || 3600);
    }
    sign(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, this.secret, {
            expiresIn: this.expiresInSeconds,
        });
        return { accessToken, expiresIn: this.expiresInSeconds };
    }
    verify(token) {
        return jsonwebtoken_1.default.verify(token, this.secret);
    }
}
exports.JwtAuthService = JwtAuthService;
//# sourceMappingURL=JwtAuthService.js.map