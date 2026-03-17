import { Repository, QueryDeepPartialEntity } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { Business } from "../../domain/business/Business";
import { Position } from "../../domain/customs/Position";
import { BusinessRepository } from "../../domain/business/BusinessRepository";
import { BusinessEntity } from "../persistence/typeorm/entities/BusinessEntity";
import { ActivityEntity } from "../persistence/typeorm/entities/ActivityEntity";
import { Route } from "../../domain/route/Route";
import { ActivityWork, BusinessActivityForPreseller } from "../../domain/customs/ActivityWork";
import { Activity } from "../../domain/activity/Activity";
import { ActivityDetailEntity } from "../persistence/typeorm/entities/ActivityDetailEntity";

export class MysqlBusinessRepository implements BusinessRepository {
  private readonly repo: Repository<BusinessEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(BusinessEntity);
  }

  private toWktPoint(pos: Position): string {
    return `POINT(${pos.lng} ${pos.lat})`;
  }

  private parseWktPoint(wkt: string): Position | null {
    const match = wkt.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/i);
    if (!match) return null;
    const lng = Number(match[1]);
    const lat = Number(match[2]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  }

  private parseXYToPoint(x: number, y: number): Position | null {
    if (Number.isNaN(x) || Number.isNaN(y)) return null;
    return { lat: x, lng: y }
  }

  private toDomain(row: BusinessEntity): Business {
    return new Business(
      row.name,
      row.business_type_id,
      row.client_id,
      row.price_type_id ?? null,
      row.area_id ?? null,
      row.nit ?? null,
      row.position ? this.parseWktPoint(row.position) : null,
      row.path_image ?? null,
      row.address ?? null,
      row.is_active ?? true,
      row.id
    );
  }

  async create(business: Business, userId: number | null): Promise<Business | null> {
    try {
      const row = await this.repo.save({
        name: business.name,
        nit: business.nit ?? null,
        position: business.position ? this.toWktPoint(business.position) : null,
        path_image: business.pathImage ?? null,
        address: business.address ?? null,
        is_active: business.isActive ?? true,
        business_type_id: business.businessTypeId,
        client_id: business.clientId,
        price_type_id: business.priceTypeId ?? null,
        area_id: business.areaId ?? null,
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

  async getAll(onlyActive: boolean = true): Promise<Business[]> {
    try {
      const rows = await this.repo.find({
        where: onlyActive ? ({ state: true } as any) : ({} as any),
        order: { name: "DESC" },
      });
      return rows.map((r) => this.toDomain(r));
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async findById(id: number): Promise<Business | null> {
    try {
      const row = await this.repo.findOneBy({ id } as any);
      return row ? this.toDomain(row) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async update(id: number, business: Partial<Business>, userId: number | null): Promise<Business | null> {
    try {
      const patch: QueryDeepPartialEntity<BusinessEntity> = {
        ...(business.name !== undefined ? { name: business.name } : {}),
        ...(business.nit !== undefined ? { nit: business.nit } : {}),
        ...(business.position !== undefined
          ? { position: business.position ? this.toWktPoint(business.position) : null }
          : {}),
        ...(business.pathImage !== undefined ? { path_image: business.pathImage } : {}),
        ...(business.address !== undefined ? { address: business.address } : {}),
        ...(business.isActive !== undefined ? { is_active: business.isActive } : {}),
        ...(business.businessTypeId !== undefined ? { business_type_id: business.businessTypeId } : {}),
        ...(business.clientId !== undefined ? { client_id: business.clientId } : {}),
        ...(business.priceTypeId !== undefined ? { price_type_id: business.priceTypeId } : {}),
        ...(business.areaId !== undefined ? { area_id: business.areaId ?? null } : {}),
        user_id: userId ?? null,
      };

      await this.repo.update({ id } as any, patch);

      const updated = await this.repo.findOneBy({ id } as any);
      return updated ? this.toDomain(updated) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async softDelete(id: number, userId: number | null): Promise<boolean> {
    try {
      await this.repo.update({ id } as any, { state: false, user_id: userId ?? null } as any);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }


  async getDistanceInMetersBetweenPoints(businessId: number, point: Position): Promise<any | null> {
    try {
      const pointWbkt = this.toWktPoint(point);
      const raw = await this.repo.createQueryBuilder("b")
        .addSelect(`
          ST_Distance_Sphere(
          position, 
          ST_GeomFromText(:pointWbkt, 4326) 
          ) 
        `, "distance")
        .setParameters({ pointWbkt })
        .where("b.id = :businessId", { businessId })
        .getRawOne();
      if (!raw) throw Error("Negocio no encontrado");
      const distance = +Number(raw.distance).toFixed(2);
      return { distance, isLessTo100: distance <= 100 }

    } catch (error) {
      console.log(error);
      return null
    }
  }


  async getBusinessActivitiesByRoute(route: Route): Promise<any | []> {
    try {
      const rows = await this.repo.createQueryBuilder("b")
        .leftJoin(
          ActivityEntity,
          "a",
          "a.business_id = b.id AND a.route_id = :routeId",
          { routeId: route.id }
        )
        .where("b.area_id = :areaId", { areaId: route.assignedIdArea })
        .andWhere("b.state = true")
        .andWhere("b.is_active = true")
        .select([
          "b.id AS business_id",
          "b.name AS business_name",
          "b.nit AS business_nit",
          "b.position AS business_position",
          "b.path_image AS business_path_image",
          "b.address AS business_address",
          "b.business_type_id AS business_type_id",
          "b.client_id AS business_client_id",
          "b.price_type_id AS business_price_type_id",
          "b.area_id AS business_area_id",

          "a.id AS act_id",
          "a.created_at AS act_created_at",
          "a.action AS act_action",
          "a.rejection_id AS act_rejection_id",
        ])
        .getRawMany();

      if (!rows.length) throw new Error("No existe");
      const businessActivities = rows.map((row) => {
        return {
          idRoute: route.id,
          business: {
            name: row.business_name,
            businessTypeId: row.business_type_id,
            clientId: row.business_client_id,
            priceTypeId: row.business_price_type_id,
            areaId: row.business_area_id,
            nit: row.business_nit,
            position: this.parseXYToPoint(row.business_position.x, row.business_position.y),
            pathImage: row.business_path_image,
            address: row.business_address,
            id: row.business_id
          },
          activity: {
            id: row.act_id,
            createdAt: row.act_created_at,
            action: row.act_action,
            rejectionId: row.act_rejection_id
          }
        }

      })

      return businessActivities;
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async getBusinessesActivityForPreseller(route: Route, activity: Activity | null): Promise<any> {
    try {
      const rows = await this.repo.createQueryBuilder("b")
        .leftJoin(
          ActivityDetailEntity,
          "ad",
          activity ? "ad.business_id = b.id AND ad.activity_id = :activityId" : "1=0",
          activity ? { activityId: activity.id } : {}
        )
        .where("b.area_id = :areaId", { areaId: route.assignedIdArea })
        .andWhere("b.state = true")
        .andWhere("b.is_active = true")
        .select([
          "b.id AS business_id",
          "b.name AS business_name",
          "b.nit AS business_nit",
          "b.position AS business_position",
          "b.path_image AS business_path_image",
          "b.address AS business_address",
          "b.business_type_id AS business_type_id",
          "b.client_id AS business_client_id",
          "b.price_type_id AS business_price_type_id",
          "b.area_id AS business_area_id",
          "ad.id AS detail_id",
          "ad.action AS detail_action",
          "ad.rejection_id AS detail_rejection_id",
        ])
        .getRawMany();

      return {
        activity: activity ?? null,
        businesses: rows.map((row) => ({
          business: {
            id: row.business_id,
            name: row.business_name,
            nit: row.business_nit,
            position: row.business_position
              ? this.parseXYToPoint(row.business_position.x, row.business_position.y)
              : null,
            pathImage: row.business_path_image,
            address: row.business_address,
            businessTypeId: row.business_type_id,
            clientId: row.business_client_id,
            priceTypeId: row.business_price_type_id,
            areaId: row.business_area_id,
          },
          activityDetail: row.detail_id ? {
            id: row.detail_id,
            action: row.detail_action,
            rejectionId: row.detail_rejection_id,
            activityId: activity?.id,
            businessId: row.business_id,
          }
            : null,
        })),
      };
    } catch (error) {
      console.log(error);
      return { activity: null, businesses: [] };
    }
  }

  async getBusinessesActivityForDistributor(businessIds: number[], activity: Activity | null): Promise<any> {
    try {
      const rows = await this.repo.createQueryBuilder("b")
        .leftJoin(
          ActivityDetailEntity,
          "ad",
          activity ? "ad.business_id = b.id AND ad.activity_id = :activityId" : "1=0",
          activity ? { activityId: activity.id } : {}
        )
        .where("b.id IN (:...businessIds)", { businessIds })
        .andWhere("b.state = true")
        .andWhere("b.is_active = true")
        .select([
          "b.id AS business_id",
          "b.name AS business_name",
          "b.nit AS business_nit",
          "b.position AS business_position",
          "b.path_image AS business_path_image",
          "b.address AS business_address",
          "b.business_type_id AS business_type_id",
          "b.client_id AS business_client_id",
          "b.price_type_id AS business_price_type_id",
          "b.area_id AS business_area_id",
          "ad.id AS detail_id",
          "ad.action AS detail_action",
          "ad.rejection_id AS detail_rejection_id",
        ])
        .getRawMany();

      return {
        activity: activity ?? null,
        businesses: rows.map((row) => ({
          business: {
            id: row.business_id,
            name: row.business_name,
            nit: row.business_nit,
            position: row.business_position
              ? this.parseXYToPoint(row.business_position.x, row.business_position.y)
              : null,
            pathImage: row.business_path_image,
            address: row.business_address,
            businessTypeId: row.business_type_id,
            clientId: row.business_client_id,
            priceTypeId: row.business_price_type_id,
            areaId: row.business_area_id,
          },
          activityDetail: row.detail_id
            ? {
              id: row.detail_id,
              action: row.detail_action,
              rejectionId: row.detail_rejection_id,
              activityId: activity?.id,
              businessId: row.business_id,
            }
            : null,
        })),
      };
    } catch (error) {
      console.log(error);
      return { activity: null, businesses: [] };
    }
  }
}
