import { Area } from "./Area";

export interface AreaRepository {
  create(area: Area, userId: number | null): Promise<Area | null>;
  getAll(): Promise<Area[]>;
  findById(id: number): Promise<Area | null>;
  update(id: number, area: Partial<Area>, userId: number | null): Promise<Area | null>;
  softDelete(id: number): Promise<boolean>;
}
