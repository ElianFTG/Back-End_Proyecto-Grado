import express from "express";
import cors from 'cors';

import AppDataSource from "./infrastructure/db/Mysql";
import path from "path";

import { UserRouter } from "./infrastructure/Express/user/UserRoutes";
import { AuthRouter } from "./infrastructure/Express/auth/AuthRoutes";
import { CountryRouter } from "./infrastructure/Express/country/CountryRoutes";
import { BranchRouter } from "./infrastructure/Express/branch/BranchRoutes";
import { SupplierRouter } from "./infrastructure/Express/supplier/SupplierRoutes";
import { CategoryRouter } from "./infrastructure/Express/category/CategoryRoutes";
import { BrandRouter } from "./infrastructure/Express/brand/BrandRoutes";
import { ProductRouter } from "./infrastructure/Express/product/ProductRoutes";
import { PresentationRouter } from "./infrastructure/Express/presentation/PresentationRoutes";
import { ColorRouter } from "./infrastructure/Express/color/ColorRoutes";
import { ClientRouter } from "./infrastructure/Express/client/ClientRoutes";
import { ClientTypeRouter } from "./infrastructure/Express/clientType/ClientTypeRoutes";
import { BusinessRouter } from "./infrastructure/Express/business/BusinessRoutes";
import { BusinessTypeRouter } from "./infrastructure/Express/businessType/BusinessTypeRoutes";
import { AreaRouter } from "./infrastructure/Express/area/AreaRoutes";
import { RouteRouter } from "./infrastructure/Express/route/RouteTypeRoutes";
import { RejectionRouter } from "./infrastructure/Express/rejection/RejectionRoutes";
import { ActivityRouter } from "./infrastructure/Express/activity/ActivityRoutes";


import { seedCountries } from "./infrastructure/db/seeders/CountrySeeder";
import { seedClientTypes } from "./infrastructure/db/seeders/ClientTypeSeeder";
import { seedBusinessTypes } from "./infrastructure/db/seeders/BusinessTypeSeeder";
import { seedRejections } from "./infrastructure/db/seeders/seedRejections";

const app = express();
app.use(cors());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/images",
  express.static(path.resolve(process.cwd(), "private/images"))
);

AppDataSource.initialize()
  .then(async () => {
    await seedCountries();
    await seedClientTypes();
    await seedBusinessTypes();
    await seedRejections();
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });



app.use(UserRouter);
app.use(AuthRouter);
app.use(CountryRouter);
app.use(SupplierRouter);
app.use(CategoryRouter);
app.use(BranchRouter);
app.use(BrandRouter);
app.use(ProductRouter);
app.use(PresentationRouter);
app.use(ColorRouter);
app.use(ClientRouter);
app.use(ClientTypeRouter);
app.use(BusinessTypeRouter);
app.use(ClientRouter);
app.use(BusinessRouter);
app.use(AreaRouter);
app.use(RouteRouter);
app.use(RejectionRouter);
app.use(ActivityRouter);


app.use((req, res, next) => {
  res.status(404).json({ message: "endpoint not found" });
});

export default app;
