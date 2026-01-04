import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { Area } from "../../domain/area/Area";
import { Position } from "../../domain/customs/Position";
import { AreaRepository } from "../../domain/area/AreaRepository";
import { AreaEntity } from "../persistence/typeorm/entities/AreaEntity";

/**
 * Repositorio MySQL para Áreas con Geometría Espacial
 * Usa queries SQL raw para manejar correctamente los tipos POLYGON
 */
export class MysqlAreaRepository implements AreaRepository {

  private readonly repo: Repository<AreaEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(AreaEntity);
  }

  /**
   * Normaliza y cierra el polígono
   */
  private normalizePolygon(points: Position[]): Position[] {
    if (!Array.isArray(points) || points.length < 3) return [];

    const cleaned: Position[] = points
      .map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }))
      .filter((p): p is Position => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

    if (cleaned.length < 3) return [];

    const first = cleaned[0]!;
    const last = cleaned[cleaned.length - 1]!;
    if (first.lat !== last.lat || first.lng !== last.lng) {
      cleaned.push({ lat: first.lat, lng: first.lng });
    }

    return cleaned;
  }

  /**
   * Convierte puntos a WKT POLYGON
   * WKT usa orden (lng lat)
   */
  private toWktPolygon(points: Position[]): string {
    const ring = this.normalizePolygon(points);
    if (ring.length < 4) return ""; // mínimo 3 puntos + cierre
    const coords = ring.map((p) => `${p.lng} ${p.lat}`).join(", ");
    return `POLYGON((${coords}))`;
  }

  /**
   * Convierte WKT POLYGON a puntos
   */
  private parseWktPolygon(wkt: string | null): Position[] {
    if (!wkt) return [];
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
      .filter((p): p is Position => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

    // Quitar punto de cierre duplicado
    if (points.length >= 2) {
      const first = points[0]!;
      const last = points[points.length - 1]!;
      if (first.lat === last.lat && first.lng === last.lng) {
        points.pop();
      }
    }

    return points;
  }

  /**
   * Crear área nueva usando SQL raw
   */
  async create(area: Area, userId: number | null): Promise<Area | null> {
    try {
      const wkt = this.toWktPolygon(area.area);
      if (!wkt) {
        console.log("Error: WKT polygon is empty");
        return null;
      }

      console.log("Creating area with WKT:", wkt);

      // Insertar con ST_GeomFromText - usando SRID 4326 (WGS84)
      const result = await AppDataSource.query(
        `INSERT INTO areas (name, area, state, user_id, created_at, updated_at) 
         VALUES (?, ST_GeomFromText(?, 4326), 1, ?, NOW(), NOW())`,
        [area.name, wkt, userId]
      );

      const insertedId = result.insertId;
      console.log("Area created with ID:", insertedId);
      
      return this.findById(insertedId);
    } catch (error) {
      console.log("Error creating area:", error);
      return null;
    }
  }

  /**
   * Obtener todas las áreas activas (state=true)
   */
  async getAll(): Promise<Area[]> {
    try {
      // Usar ST_AsText para obtener el WKT
      const rows = await AppDataSource.query(
        `SELECT id, name, ST_AsText(area) as area_wkt, state, user_id, created_at, updated_at 
         FROM areas 
         WHERE state = 1 
         ORDER BY id DESC`
      );

      return rows.map((row: any) => new Area(
        row.name,
        this.parseWktPolygon(row.area_wkt),
        row.id
      ));
    } catch (error) {
      console.log("Error getting areas:", error);
      return [];
    }
  }

  /**
   * Buscar área por ID (solo activas)
   */
  async findById(id: number): Promise<Area | null> {
    try {
      const rows = await AppDataSource.query(
        `SELECT id, name, ST_AsText(area) as area_wkt, state, user_id, created_at, updated_at 
         FROM areas 
         WHERE id = ? AND state = 1`,
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return new Area(
        row.name,
        this.parseWktPolygon(row.area_wkt),
        row.id
      );
    } catch (error) {
      console.log("Error finding area:", error);
      return null;
    }
  }

  /**
   * Actualizar área
   */
  async update(id: number, area: Partial<Area>, userId: number | null): Promise<Area | null> {
    try {
      // Verificar que existe y está activa
      const existing = await this.findById(id);
      if (!existing) return null;

      // Construir query dinámicamente
      const updates: string[] = [];
      const params: any[] = [];

      if (area.name !== undefined) {
        updates.push("name = ?");
        params.push(area.name);
      }

      if (area.area !== undefined) {
        const wkt = this.toWktPolygon(area.area);
        if (wkt) {
          updates.push("area = ST_GeomFromText(?, 4326)");
          params.push(wkt);
        }
      }

      updates.push("user_id = ?");
      params.push(userId);

      updates.push("updated_at = NOW()");

      params.push(id);

      await AppDataSource.query(
        `UPDATE areas SET ${updates.join(", ")} WHERE id = ? AND state = 1`,
        params
      );

      return this.findById(id);
    } catch (error) {
      console.log("Error updating area:", error);
      return null;
    }
  }

  /**
   * Soft delete - cambia state a false
   */
  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await AppDataSource.query(
        `UPDATE areas SET state = 0, updated_at = NOW() WHERE id = ? AND state = 1`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.log("Error deleting area:", error);
      return false;
    }
  }
}
