import { AreaRepository } from "../../domain/area/AreaRepository";

export class SoftDeleteArea {
  constructor(private repo: AreaRepository) {}

  async run(id: number): Promise<boolean> {
    return this.repo.softDelete(id);
  }
}
