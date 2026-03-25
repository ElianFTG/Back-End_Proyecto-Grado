import { Route } from "../../domain/route/Route";
import { RouteRepository } from "../../domain/route/RouteRepository";

export class GetRoutes {
  constructor(private repo: RouteRepository) {}

  async run(): Promise<Route[] | null> {
    return this.repo.getRoutes();
  }
}
