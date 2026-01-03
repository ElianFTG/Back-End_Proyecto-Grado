import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";
import { Area } from "../../domain/area/Area";
import { Position } from "../../domain/customs/Position";
import { AreaRepository } from "../../domain/area/AreaRepository";
import { AreaEntity, AreaPoint } from "../persistence/typeorm/entities/AreaEntity";

/**
 * Repositorio MySQL para Áreas
 * 
 * Almacena el polígono como JSON array de {lat, lng}
 * Sin dependencias de PostGIS ni geometría espacial
 */
export class MysqlAreaRepository implements AreaRepository {
  private readonly repo: Repository<AreaEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(AreaEntity);
  }

  /**
   * Valida y normaliza los puntos del área
   * - Mínimo 3 puntos
   * - lat: -90 a 90
   * - lng: -180 a 180
   */
  private validateAndNormalize(points: Position[]): AreaPoint[] | null {
    if (!Array.isArray(points) || points.length < 3) {
      return null;
    }

    const normalized: AreaPoint[] = [];

    for (const p of points) {
      const lat = Number(p.lat);
      const lng = Number(p.lng);

      // Validar rangos
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      if (lat < -90 || lat > 90) return null;
      if (lng < -180 || lng > 180) return null;

      normalized.push({ lat, lng });
    }

    return normalized.length >= 3 ? normalized : null;
  }

  /**
   * Convierte entidad a dominio
   */
  private toDomain(entity: AreaEntity): Area {
    const area = new Area(
      entity.name,
      entity.area as Position[],
      entity.id
    );
    return area;
  }

  /**
   * Crear área nueva
   */
  async create(area: Area, userId: number | null): Promise<Area | null> {
    try {
      const normalized = this.validateAndNormalize(area.area);
      if (!normalized) return null;

      const entity = this.repo.create({
        name: area.name,
        area: normalized,
        state: true,
        user_id: userId,
      });

      const saved = await this.repo.save(entity);
      return this.toDomain(saved);
    } catch (error) {
      console.error("Error creating area:", error);
      return null;
    }
  }

  /**
   * Obtener todas las áreas activas
   */
  async getAll(): Promise<Area[]> {
    try {
      const entities = await this.repo.find({
        where: { state: true },
        order: { id: "DESC" },
      });
      return entities.map((e) => this.toDomain(e));
    } catch (error) {
      console.error("Error getting areas:", error);
      return [];
    }
  }

  /**
   * Buscar área por ID
   */
  async findById(id: number): Promise<Area | null> {
    try {
      const entity = await this.repo.findOne({
        where: { id, state: true },
      });
      return entity ? this.toDomain(entity) : null;
    } catch (error) {
      console.error("Error finding area:", error);
      return null;
    }
  }

  /**
   * Actualizar área
   */
  async update(
    id: number,
    patch: Partial<Area>,
    userId: number | null
  ): Promise<Area | null> {
    try {
      const entity = await this.repo.findOne({
        where: { id, state: true },
      });
      if (!entity) return null;

      if (patch.name !== undefined) {
        entity.name = patch.name;
      }

      if (patch.area !== undefined) {
        const normalized = this.validateAndNormalize(patch.area);
        if (!normalized) return null;
        entity.area = normalized;
      }

      entity.user_id = userId;

      const saved = await this.repo.save(entity);
      return this.toDomain(saved);
    } catch (error) {
      console.error("Error updating area:", error);
      return null;
    }
  }

  /**
   * Soft delete - cambia state a false
   */
  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.repo.update(
        { id, state: true },
        { state: false }
      );
      return (result.affected ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting area:", error);
      return false;
    }
  }
}
