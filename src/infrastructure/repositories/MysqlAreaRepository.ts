import { Repository, QueryDeepPartialEntity } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { Area } from "../../domain/area/Area";
import { Position } from "../../domain/customs/Position";
import { AreaRepository } from "../../domain/area/AreaRepository";
import { AreaEntity } from "../persistence/typeorm/entities/AreaEntity";

export class MysqlAreaRepository implements AreaRepository {

  private readonly repo: Repository<AreaEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(AreaEntity);
  }

  private normalizePolygon(points: Position[]): Position[] {
    if (!Array.isArray(points) || points.length < 3) return [];

    const cleaned = points
      .map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }))
      .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

    if (cleaned.length < 3) return [];

    const first: any = cleaned[0];
    const last: any = cleaned[cleaned.length - 1];
    if (first.lat !== last.lat || first.lng !== last.lng) {
      cleaned.push({ ...first });
    }

    return cleaned;
  }

  private toWktPolygon(points: Position[]): string {
    const ring = this.normalizePolygon(points);
    const coords = ring.map((p) => `${p.lng} ${p.lat}`).join(", ");
    return `POLYGON((${coords}))`;
  }

  private parseWktPolygon(wkt: string): Position[] {
    const match = wkt.match(/POLYGON\s*\(\(\s*(.+?)\s*\)\)\s*$/i);
    if (!match || match[1] === undefined) return [];

    const pairs = match[1].split(",").map((s) => s.trim());
    const points: Position[] = pairs
      .map((pair) => {
        const [lngStr, latStr] = pair.split(/\s+/);
        const lng = Number(lngStr);
        const lat = Number(latStr);
        return { lat, lng };
      })
      .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

    if (points.length >= 2) {
      const first: any = points[0];
      const last: any = points[points.length - 1];

      if (first.lat === last.lat && first.lng === last.lng) {
        points.pop();
      }
    }

    return points;
  }

  private toDomain(row: AreaEntity): Area {
    return new Area(row.name, this.parseWktPolygon(row.area), row.id);
  }

  async create(area: Area, userId: number | null): Promise<Area | null> {
    try {
      const wkt = this.toWktPolygon(area.area);
      if (!wkt || area.area.length < 3) return null;

      const row = await this.repo.save({
        name: area.name,
        area: wkt,
        state: true,
        user_id: userId ?? null,
      });

      const created = await this.repo.findOneBy({ id: row.id });
      return created ? this.toDomain(created) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAll(): Promise<Area[]> {
    try {
      const rows = await this.repo.find({ 
        where: { state: true },
        order: { id: "DESC" } 
      });
      return rows.map((r) => this.toDomain(r));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findById(id: number): Promise<Area | null> {
    try {
      const row = await this.repo.findOneBy({ id, state: true } as any);
      return row ? this.toDomain(row) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async update(id: number, area: Partial<Area>, userId: number | null): Promise<Area | null> {
    try {
      const patch: QueryDeepPartialEntity<AreaEntity> = {
        ...(area.name !== undefined ? { name: area.name } : {}),
        ...(area.area !== undefined ? { area: this.toWktPolygon(area.area) } : {}),
        user_id: userId ?? null,
      };

      await this.repo.update({ id, state: true } as any, patch);

      const updated = await this.repo.findOneBy({ id, state: true } as any);
      return updated ? this.toDomain(updated) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.repo.update({ id, state: true } as any, { state: false });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
