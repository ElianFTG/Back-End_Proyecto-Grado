import { Route } from "../../domain/route/Route";
import { RouteRepository } from "../../domain/route/RouteRepository";

export class UpdateRoute {
  constructor(private repo: RouteRepository) {}

  async run(
    id: number,
    fields: Partial<Pick<Route, "assignedDate" | "assignedIdUser" | "assignedIdArea">>,
    auditUserId: number | null
  ): Promise<Route | null> {
    return this.repo.update(id, fields, auditUserId);
  }
}