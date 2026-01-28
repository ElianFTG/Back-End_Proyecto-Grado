import { Business } from "./Business";
import { ActivityWork } from "../customs/ActivityWork";
import { Route } from "../route/Route";
import { Position } from "../customs/Position";

export interface BusinessRepository {
  create(business: Business, userId: number | null): Promise<Business | null>;
  getAll(onlyActive?: boolean): Promise<Business[]>;
  findById(id: number): Promise<Business | null>;
  update(id: number, business: Partial<Business>, userId: number | null): Promise<Business | null>;
  softDelete(id: number, userId: number | null): Promise<boolean>;

  getDistanceInMetersBetweenPoints(businessId: number, point: Position) : Promise<any | null>;
  getBusinessActivitiesByRoute(route: Route) : Promise<ActivityWork[] | []>;
}
