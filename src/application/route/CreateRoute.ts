import { Route } from "../../domain/route/Route";
import { RouteRepository } from "../../domain/route/RouteRepository";

export class CreateRoute {
  constructor(private repo: RouteRepository) {}

  async run(route: Route, auditUserId: number | null): Promise<Route | null> {
    return this.repo.create(route, auditUserId);
  }
}
