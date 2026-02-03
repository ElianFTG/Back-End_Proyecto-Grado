import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { PriceType } from "../../domain/priceType/PriceType";
import { PriceTypeRepository } from "../../domain/priceType/PriceTypeRepository";
import { PriceTypeEntity } from "../persistence/typeorm/entities/PriceTypeEntity";

export class MysqlPriceTypeRepository implements PriceTypeRepository {
  private readonly repo: Repository<PriceTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(PriceTypeEntity);
  }

  private toDomain(row: PriceTypeEntity): PriceType {
    return new PriceType(row.name, row.id);
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async create(type: PriceType, userId: number | null): Promise<PriceType | null> {
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

  async getAll(onlyActive: boolean = true): Promise<PriceType[]> {
    const rows = await this.repo.find({
      where: { state: true },
      order: { name: "ASC" },
    });
    return rows.map((r) => this.toDomain(r));
  }
}
