import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { ClientType } from "../../domain/clientType/ClientType";
import { ClientTypeRepository } from "../../domain/clientType/ClientTypeRepository";
import { ClientTypeEntity } from "../persistence/typeorm/entities/ClientTypeEntity";

export class MysqlClientTypeRepository implements ClientTypeRepository {
  private readonly repo: Repository<ClientTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ClientTypeEntity);
  }

  private toDomain(row: ClientTypeEntity): ClientType {
    return new ClientType(row.name, row.id);
  }

  async count(): Promise<number> {
      return this.repo.count();
  }

  async create(type: ClientType, userId: number | null): Promise<ClientType | null> {
    try {
      const row = await this.repo.save({
        name: type.name,
        user_id: userId ?? null,
        state: true,
      });
      const created = await this.repo.findOneBy({ id: row.id } as any);
      return created ? this.toDomain(created) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getAll(onlyActive: boolean = true): Promise<ClientType[]> {
    const rows = await this.repo.find({
      where: { state: true },
      order: { name: "ASC" },
    });
    return rows.map((r) => this.toDomain(r));
  }
}
