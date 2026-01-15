import { Repository, QueryDeepPartialEntity } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";
import { ClientEntity } from "../persistence/typeorm/entities/ClientEntity";

export class MysqlClientRepository implements ClientRepository {
  private readonly repo: Repository<ClientEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ClientEntity);
  }

  private toDomain(row: ClientEntity): Client {
    return new Client(
      row.name,
      row.last_name,
      row.second_last_name,
      row.phone,
      row.client_type_id,
      row.ci ?? null,
      row.id
    );
  }

  async create(client: Client, userId: number): Promise<Client | null> {
    try {
      const row = await this.repo.save({
        name: client.name,
        last_name: client.lastName,
        second_last_name: client.secondLastName,
        phone: client.phone,
        ci: client.ci ?? null,
        client_type_id: client.clientTypeId,
        user_id: userId,
        state: true,
      });

      const created = await this.repo.findOneBy({ id: row.id } as any);
      return created ? this.toDomain(created) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getAll(): Promise<Client[]> {
    try {
      const rows = await this.repo.find({
        where: { state: true },
        order: { last_name: "DESC" },
      });
      return rows.map((r) => this.toDomain(r));
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async findById(id: number): Promise<Client | null> {
    try {
      const row = await this.repo.findOneBy({ id });
      return row ? this.toDomain(row) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async update(id: number, client: Partial<Client>, userId: number ): Promise<Client | null> {
    try {
      const patch: QueryDeepPartialEntity<ClientEntity> = {
        ...(client.name !== undefined ? { name: client.name } : {}),
        ...(client.lastName !== undefined ? { last_name: client.lastName } : {}),
        ...(client.secondLastName !== undefined ? { second_last_name: client.secondLastName } : {}),
        ...(client.phone !== undefined ? { phone: client.phone } : {}),
        ...(client.ci !== undefined ? { ci: client.ci } : {}),
        ...(client.clientTypeId !== undefined ? { client_type_id: client.clientTypeId } : {}),
        user_id: userId,
      };
      await this.repo.update({ id }, patch);
      const updated = await this.repo.findOneBy({ id });
      return updated ? this.toDomain(updated) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async softDelete(id: number, userId: number): Promise<boolean> {
    try {
      await this.repo.update({ id }, { state: false, user_id: userId });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
