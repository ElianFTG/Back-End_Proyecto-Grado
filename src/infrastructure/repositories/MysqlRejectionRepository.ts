import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { RejectionEntity } from "../persistence/typeorm/entities/RejectionEntity";
import { Rejection } from "../../domain/rejection/Rejection";
import { RejectionRepository } from "../../domain/rejection/RejectionRepository";

export class MysqlRejectionRepository implements RejectionRepository {
  private readonly repo: Repository<RejectionEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(RejectionEntity);
  }

  private toDomain(row: RejectionEntity): Rejection {
    return new Rejection(row.name, row.id);
  }

  async create(rejection: Rejection, userId: number | null): Promise<Rejection | null> {
    try {
      const row = await this.repo.save({
        name: rejection.name,
        user_id: userId ?? null,
        state: true,
      });

      return this.toDomain(row);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getAll(): Promise<Rejection[]> {
    try {
      const rows = await this.repo.find({
        where: { state: true },
        order: { id: "ASC" },
      });
      return rows.map((r) => this.toDomain(r));
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
