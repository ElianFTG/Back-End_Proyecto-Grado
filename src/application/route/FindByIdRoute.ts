import { Route } from "../../domain/route/Route";
import { RouteRepository } from "../../domain/route/RouteRepository";

export class FindByIdRoute {
  constructor(private repo: RouteRepository) {}

  async run(id: number): Promise<Route | null> {
    return this.repo.findById(id);
  }
}
