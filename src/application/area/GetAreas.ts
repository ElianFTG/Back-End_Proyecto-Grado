import { Area } from "../../domain/area/Area";
import { AreaRepository } from "../../domain/area/AreaRepository";

export class GetAreas {
  constructor(private repo: AreaRepository) {}

  async run(): Promise<Area[]> {
    return this.repo.getAll();
  }
}
