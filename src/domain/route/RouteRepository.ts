import { Route } from "./Route";

export interface RouteRepository {
  create(route: Route, auditUserId: number | null): Promise<Route | null>;
  findById(id: number): Promise<Route | null>;
  findAreaForRouteByUserAndDate(userId: number, assignedDate: string) : Promise<number | null>;
}
