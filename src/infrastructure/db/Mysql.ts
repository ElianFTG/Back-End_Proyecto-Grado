import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../persistence/typeorm/entities/UserEntity';
import { CountryEntity } from '../persistence/typeorm/entities/CountryEntity';
import { CategoryEntity } from '../persistence/typeorm/entities/CategoryEntity';
import { SupplierEntity } from '../persistence/typeorm/entities/SupplierEntity';
import { BranchEntity } from '../persistence/typeorm/entities/BranchEntity';
import { BrandEntity } from '../persistence/typeorm/entities/BrandEntity';
import { ProductEntity } from '../persistence/typeorm/entities/ProductEntity';
import { ProductBranchEntity } from '../persistence/typeorm/entities/ProductBranchEntity';
import { ClientTypeEntity } from "../persistence/typeorm/entities/ClientTypeEntity";
import { ClientEntity } from "../persistence/typeorm/entities/ClientEntity";
import { BusinessTypeEntity } from "../persistence/typeorm/entities/BusinessTypeEntity";
import { BusinessEntity } from "../persistence/typeorm/entities/BusinessEntity";
import { AreaEntity } from '../persistence/typeorm/entities/AreaEntity';
import { PresentationEntity } from '../persistence/typeorm/entities/PresentationEntity';
import { ColorEntity } from '../persistence/typeorm/entities/ColorEntity';
import { RouteEntity } from '../persistence/typeorm/entities/RouteEntity';
import { RejectionEntity } from '../persistence/typeorm/entities/RejectionEntity';

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
    BrandEntity,
    ProductEntity,
    ProductBranchEntity,
    ClientEntity,
    ClientTypeEntity,
    BusinessTypeEntity,
    BusinessEntity,
    AreaEntity,
    PresentationEntity,
    ColorEntity,
    RouteEntity,
    RejectionEntity
  ],
  synchronize: true,
  logging: false,
  legacySpatialSupport: false,
});


export default AppDataSource;
