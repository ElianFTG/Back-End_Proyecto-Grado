import { AppDataSource } from "../Mysql";
import { BusinessTypeEntity } from "../../persistence/typeorm/entities/BusinessTypeEntity";

export async function seedBusinessTypes() {
  const repo = AppDataSource.getRepository(BusinessTypeEntity);
  const count = await repo.count();
  if (count > 0) return;

  await repo.save([
    {name: "Ferretería", user_id: null, state: true },
    {name: "Tienda", user_id: null, state: true },
    {name: "Distribuidor", user_id: null, state: true},
    {name: "Constructora", user_id: null, state: true },
    
  ]);
}
