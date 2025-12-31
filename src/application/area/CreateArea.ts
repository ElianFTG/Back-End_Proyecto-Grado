import { Area } from "../../domain/area/Area";
import { AreaRepository } from "../../domain/area/AreaRepository";

export class CreateArea {
  constructor(private repo: AreaRepository) {}

  async run(area: Area, userId: number | null): Promise<Area | null> {
    return this.repo.create(area, userId);
  }
}
