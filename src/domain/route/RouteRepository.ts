
import { Route } from "./Route";

export interface RouteRepository {
  create(route: Route, auditUserId: number | null): Promise<Route | null>;
  findById(id: number): Promise<Route | null>;
  //VerifyByUserIdDate
  findAreaForRouteByUserAndDate(userId: number, assignedDate: string) : Promise<Route | null>;
}
