import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { BusinessType } from "../../domain/businessType/BusinessType";
import { BusinessTypeRepository } from "../../domain/businessType/BusinessTypeRepository";
import { BusinessTypeEntity } from "../persistence/typeorm/entities/BusinessTypeEntity";

export class MysqlBusinessTypeRepository implements BusinessTypeRepository {
  private readonly repo: Repository<BusinessTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(BusinessTypeEntity);
  }

  private toDomain(row: BusinessTypeEntity): BusinessType {
    return new BusinessType(row.name, row.id);
  }
  
  async count(): Promise<number> {
      return this.repo.count();
  }

  async create(type: BusinessType, userId: number | null): Promise<BusinessType | null> {
    try {
      const row = await this.repo.save({
        name: type.name,
        user_id: userId ?? null,
        state: true,
      });
      const created = await this.repo.findOneBy({ id: row.id });
      return created ? this.toDomain(created) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getAll(onlyActive: boolean = true): Promise<BusinessType[]> {
    const rows = await this.repo.find({
      where: { state: true },
      order: { name: "ASC" },
    });
    return rows.map((r) => this.toDomain(r));
  }
}
