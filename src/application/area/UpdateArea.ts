import { Area } from "../../domain/area/Area";
import { AreaRepository } from "../../domain/area/AreaRepository";

export class UpdateArea {
  constructor(private repo: AreaRepository) {}

  async run(id: number, area: Partial<Area>, userId: number | null): Promise<Area | null> {
    return this.repo.update(id, area, userId);
  }
}
