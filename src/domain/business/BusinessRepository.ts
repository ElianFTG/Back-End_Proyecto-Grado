import { Business } from "./Business";
import { ActivityWork, BusinessActivityForPreseller } from "../customs/ActivityWork";
import { Route } from "../route/Route";
import { Position } from "../customs/Position";
import { Activity } from "../activity/Activity";

export interface PaginatedBusinessesResult {
  data: Business[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BusinessRepository {
  create(business: Business, userId: number | null): Promise<Business | null>;
  getAll(filters: { search?: string; areaId?: number; state?: boolean; page?: number; limit?: number }): Promise<PaginatedBusinessesResult>;
  findById(id: number): Promise<Business | null>;
  update(id: number, business: Partial<Business>, userId: number | null): Promise<Business | null>;
  softDelete(id: number, userId: number | null): Promise<boolean>;
  getDistanceInMetersBetweenPoints(businessId: number, point: Position): Promise<any | null>;
  getBusinessActivitiesByRoute(route: Route): Promise<ActivityWork[] | []>;
  getBusinessesActivityForPreseller(route: Route, activity: Activity | null): Promise<BusinessActivityForPreseller>;
  getBusinessesActivityForDistributor(businessIds: number[], activity: Activity | null): Promise<BusinessActivityForPreseller>;
}