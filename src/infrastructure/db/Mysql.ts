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
import { ProductPriceEntity } from '../persistence/typeorm/entities/ProductPriceEntity';
import { PriceTypeEntity } from "../persistence/typeorm/entities/PriceTypeEntity";
import { ClientEntity } from "../persistence/typeorm/entities/ClientEntity";
import { BusinessTypeEntity } from "../persistence/typeorm/entities/BusinessTypeEntity";
import { ClientTypeEntity } from '../persistence/typeorm/entities/ClientTypeEntity';
import { BusinessEntity } from "../persistence/typeorm/entities/BusinessEntity";
import { AreaEntity } from '../persistence/typeorm/entities/AreaEntity';
import { PresentationEntity } from '../persistence/typeorm/entities/PresentationEntity';
import { ColorEntity } from '../persistence/typeorm/entities/ColorEntity';
import { RouteEntity } from '../persistence/typeorm/entities/RouteEntity';
import { RejectionEntity } from '../persistence/typeorm/entities/RejectionEntity';
import { ActivityEntity } from '../persistence/typeorm/entities/ActivityEntity';
import { PresaleEntity } from '../persistence/typeorm/entities/PresaleEntity';
import { PresaleDetailEntity } from '../persistence/typeorm/entities/PresaleDetailEntity';
import { PresaleStatusHistoryEntity } from '../persistence/typeorm/entities/PresaleStatusHistoryEntity';

import { config } from 'dotenv';
import { ActivityDetailEntity } from '../persistence/typeorm/entities/ActivityDetailEntity';

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
    ProductPriceEntity,
    ClientEntity,
    PriceTypeEntity,
    BusinessTypeEntity,
    ClientTypeEntity,
    BusinessEntity,
    AreaEntity,
    PresentationEntity,
    ColorEntity,
    RouteEntity,
    RejectionEntity,
    ActivityEntity,
    ActivityDetailEntity,
    PresaleEntity,
    PresaleDetailEntity,
    PresaleStatusHistoryEntity,
  ],
  synchronize: true,
  logging: false,
  legacySpatialSupport: false,
});


export default AppDataSource;
