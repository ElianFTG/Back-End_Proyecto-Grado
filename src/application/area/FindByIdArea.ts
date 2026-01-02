import { Area } from "../../domain/area/Area";
import { AreaRepository } from "../../domain/area/AreaRepository";

export class FindByIdArea {
  constructor(private repo: AreaRepository) {}

  async run(id: number): Promise<Area | null> {
    return this.repo.findById(id);
  }
}
