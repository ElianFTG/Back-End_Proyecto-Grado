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
import { seedCountries } from "./infrastructure/db/seeders/CountrySeeder";
import { ClientRouter } from "./infrastructure/Express/client/ClientRoutes"

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
app.use(ClientRouter)


app.use((req, res, next) => {
  res.status(404).json({ message: "endpoint not found" });
});

export default app;
