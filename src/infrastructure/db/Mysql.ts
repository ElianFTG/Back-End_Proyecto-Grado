import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../persistence/typeorm/entities/UserEntity';
import { CountryEntity } from '../persistence/typeorm/entities/CountryEntity';
import { CategoryEntity } from '../persistence/typeorm/entities/CategoryEntity';
import { SupplierEntity } from '../persistence/typeorm/entities/SupplierEntity';
import { BranchEntity } from '../persistence/typeorm/entities/BranchEntity';
// import { ProductEntity } from '../persistence/typeorm/entities/ProductEntity';
// import { ProductSupplierEntity } from '../persistence/typeorm/entities/ProductSupplierEntity';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  connectorPackage: "mysql2",
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 0),
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  entities: [
    UserEntity,
    CountryEntity,
    CategoryEntity,
    SupplierEntity,
    BranchEntity,
    // ProductEntity,
    // ProductSupplierEntity
  ],
  synchronize: true,
  logging: false,
});


export default AppDataSource;
