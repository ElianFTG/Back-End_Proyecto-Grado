import { AppDataSource } from "../Mysql";
import { ClientTypeEntity } from "../../persistence/typeorm/entities/ClientTypeEntity";

export async function seedClientTypes() {
  const repo = AppDataSource.getRepository(ClientTypeEntity);
  const count = await repo.count();
  if (count > 0) return;

  await repo.save([
    {name: "regular", user_id: null, state: true },
    {name: "minorista", user_id: null, state: true },
    {name: "mayorista", user_id: null, state: true },
    {name: "institucional", user_id: null, state: true}
  ]);
}
