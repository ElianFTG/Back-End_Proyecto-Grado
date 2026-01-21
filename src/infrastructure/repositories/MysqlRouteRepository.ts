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
    } catch (error) {
      console.log(error);
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

  
  async findAreaForRouteByUserAndDate(userId: number, assignedDate: string) : Promise<number | null>{
    try {
      const start = new Date(`${assignedDate}T00:00:00.000Z`);
      const end = new Date(`${assignedDate}T23:59:59.999Z`);
      const row = await this.repo.createQueryBuilder("r")
        .select("r.assigned_id_area", "assigned_id_area")
        .where("r.assigned_id_user = :uid", { uid: userId })
        .andWhere("r.assigned_date >= :start AND r.assigned_date <= :end", { start, end })
        .orderBy("r.id", "DESC")
        .getRawOne<{ assigned_id_area: number }>();
      if(!row) throw new Error("No existe");
      const areaId = Number(row.assigned_id_area);
      return areaId;
    } catch (error) {
      console.log(error)
      return null;
    }
  }
  
}
