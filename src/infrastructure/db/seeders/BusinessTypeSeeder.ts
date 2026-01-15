import { AppDataSource } from "../Mysql";
import { BusinessTypeEntity } from "../../persistence/typeorm/entities/BusinessTypeEntity";

export async function seedBusinessTypes() {
  const repo = AppDataSource.getRepository(BusinessTypeEntity);
  const count = await repo.count();
  if (count > 0) return;

  await repo.save([
    {name: "Ferretería", user_id: null, state: true },
    {name: "Electricidad", user_id: null, state: true },
    {name: "Construcción", user_id: null, state: true },
  ]);
}
