import { Repository, QueryDeepPartialEntity, Brackets } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { Client } from "../../domain/client/Client";
import { ClientRepository, SearchClientsParams } from "../../domain/client/ClientRepository";
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

  /**
   * Búsqueda dinámica de clientes por apellidos, nombres, ci o teléfono.
   * Divide el término de búsqueda en palabras y busca que TODAS coincidan con alguno de los campos.
   * Retorna máximo `limit` resultados (por defecto 10)
   * Solo busca clientes activos (state = true)
   */
  async search(params: SearchClientsParams): Promise<Client[]> {
    try {
      const { search = '', limit = 10 } = params;
      
      if (!search.trim()) {
        const rows = await this.repo.find({
          where: { state: true },
          order: { last_name: 'ASC', second_last_name: 'ASC', name: 'ASC' },
          take: limit,
        });
        return rows.map((r) => this.toDomain(r));
      }

      const words = search.trim().split(/\s+/);
      const qb = this.repo.createQueryBuilder('c')
        .where('c.state = :state', { state: true });

      words.forEach((word, index) => {
        const paramName = `word${index}`;
        const likeTerm = `%${word}%`;
        qb.andWhere(
          new Brackets((qb) => {
            qb.where('c.last_name LIKE :term', { term: likeTerm })
              .orWhere('c.second_last_name LIKE :term', { term: likeTerm })
              .orWhere('c.name LIKE :term', { term: likeTerm })
              .orWhere('c.ci LIKE :term', { term: likeTerm })
              .orWhere('c.phone LIKE :term', { term: likeTerm });
          })
        );
      });

      const rows = await qb
        .orderBy('c.last_name', 'ASC')
        .addOrderBy('c.second_last_name', 'ASC')
        .addOrderBy('c.name', 'ASC')
        .take(limit)
        .getMany();

      return rows.map((r) => this.toDomain(r));
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
