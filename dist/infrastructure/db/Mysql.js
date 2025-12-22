"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const UserEntity_1 = require("../persistence/typeorm/entities/UserEntity");
const CountryEntity_1 = require("../persistence/typeorm/entities/CountryEntity");
const CategoryEntity_1 = require("../persistence/typeorm/entities/CategoryEntity");
const SupplierEntity_1 = require("../persistence/typeorm/entities/SupplierEntity");
// import { ProductEntity } from '../persistence/typeorm/entities/ProductEntity';
// import { ProductSupplierEntity } from '../persistence/typeorm/entities/ProductSupplierEntity';
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    connectorPackage: "mysql2",
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 0),
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    entities: [
        UserEntity_1.UserEntity,
        CountryEntity_1.CountryEntity,
        CategoryEntity_1.CategoryEntity,
        SupplierEntity_1.SupplierEntity,
        // ProductEntity,
        // ProductSupplierEntity
    ],
    synchronize: true,
    logging: false,
});
exports.default = exports.AppDataSource;
//# sourceMappingURL=Mysql.js.map