import express from "express";
import cors from 'cors';
import fileUpload from "express-fileupload";
import AppDataSource from "./infrastructure/db/Mysql";
import { UserRouter } from "./infrastructure/Express/user/UserRoutes";
import { AuthRouter } from "./infrastructure/Express/auth/AuthRoutes";

const app = express();
app.use(cors());

app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.use(UserRouter);
app.use(AuthRouter);


app.use((req, res, next) => {
  res.status(404).json({ message: "endpoint not found" });
});

export default app;
