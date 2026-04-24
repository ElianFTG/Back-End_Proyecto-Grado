import { Repository, QueryDeepPartialEntity } from "typeorm";
import { AppDataSource } from "../db/Mysql";

import { Route } from "../../domain/route/Route";
import { RouteRepository } from "../../domain/route/RouteRepository";
import { RouteEntity } from "../persistence/typeorm/entities/RouteEntity";
export class MysqlRouteRepository implements RouteRepository {
  private readonly repo: Repository<RouteEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(RouteEntity);
  }

  private toDomain(row: RouteEntity): Route {
    return new Route(
      row.assigned_date,
      row.assigned_id_user,
      row.assigned_id_area,
      row.id
    );
  }

  async create(route: Route, auditUserId: number | null): Promise<Route | null> {
    try {
      const row = await this.repo.save({
        assigned_date: route.assignedDate,
        assigned_id_user: route.assignedIdUser,
        assigned_id_area: route.assignedIdArea,
        user_id: auditUserId ?? null,
      });
      const created = await this.repo.findOneBy({ id: row.id });
      return created ? this.toDomain(created) : null;
    } catch (error: any) {
      console.log(error);
      if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
        throw new Error("ROUTE_USER_DATE_DUPLICATE");
      }
      return null;
    }
  }

  async findById(id: number): Promise<Route | null> {
    try {
      const row = await this.repo.findOneBy({ id });
      return row ? this.toDomain(row) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }


  async findAreaForRouteByUserAndDate(userId: number, assignedDate: string): Promise<Route | null> {
    try {
      const row = await this.repo.createQueryBuilder("r")
        .select()
        .where("r.assigned_id_user = :uid", { uid: userId })
        .andWhere("r.assigned_date = :assignedDate", { assignedDate })
        .orderBy("r.id", "DESC")
        .getOne();
      if (!row) throw new Error("No existe fecha o usuario");
      const foundRoute = this.toDomain(row)
      return foundRoute;
    } catch (error) {
      console.log(error)
      return null;
    }
  }

  async getRoutes(): Promise<Route[] | null> {
    try {
      const rows = await this.repo.find();

      return rows.map(row => this.toDomain(row));
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async update(
    id: number,
    fields: Partial<Pick<Route, "assignedDate" | "assignedIdUser" | "assignedIdArea">>,
    auditUserId: number | null
  ): Promise<Route | null> {
    try {
      const toUpdate: Partial<RouteEntity> = { user_id: auditUserId ?? null };

      if (fields.assignedDate !== undefined) {
        toUpdate.assigned_date = fields.assignedDate;
      }
      if (fields.assignedIdUser !== undefined) {
        toUpdate.assigned_id_user = fields.assignedIdUser;
      }
      if (fields.assignedIdArea !== undefined) {
        toUpdate.assigned_id_area = fields.assignedIdArea;
      }

      await this.repo.update({ id }, toUpdate);
      const updated = await this.repo.findOneBy({ id });
      return updated ? this.toDomain(updated) : null;
    } catch (error: any) {
      console.log(error);
      if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
        throw new Error("ROUTE_USER_DATE_DUPLICATE");
      }
      return null;
    }
  }


}
