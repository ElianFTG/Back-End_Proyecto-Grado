import { AppDataSource } from "../Mysql";
import { RejectionEntity } from "../../persistence/typeorm/entities/RejectionEntity";

export async function seedRejections() {
  const repo = AppDataSource.getRepository(RejectionEntity);

  const count = await repo.count();
  if (count > 1) {
    console.log("Rejections already populated, skipping seed");
    return;
  }

  const data = [
    { name: "Ninguno" },
    { name: "Dueño Ausente" },
    { name: "Negocio cerrado" },
    { name: "Abastecido" },
    { name: "Insuficiente capital" },
  ];

  await repo.save(
    data.map((d) => ({
      ...d,
      state: true,
      user_id: null,
    }))
  );

  console.log("Rejections seeded");
}
