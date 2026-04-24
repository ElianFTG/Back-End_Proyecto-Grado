
import { Route } from "./Route";

export interface RouteRepository {
  create(route: Route, auditUserId: number | null): Promise<Route | null>;
  findById(id: number): Promise<Route | null>;
  findAreaForRouteByUserAndDate(userId: number, assignedDate: string) : Promise<Route | null>;
  getRoutes(): Promise<Route[] | null>;
  update(id: number, fields: Partial<Pick<Route, "assignedDate" | "assignedIdUser" | "assignedIdArea">>, auditUserId: number | null): Promise<Route | null>;
}
