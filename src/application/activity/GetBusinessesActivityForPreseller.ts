import { ActivityRepository } from "../../domain/activity/ActivityRepository";
import { BusinessRepository } from "../../domain/business/BusinessRepository";
import { RouteRepository } from "../../domain/route/RouteRepository";
import { BusinessActivityForPreseller } from "../../domain/customs/ActivityWork";

export class GetBusinessesActivityForPreseller {
  constructor(
    private activityRepo: ActivityRepository,
    private businessRepo: BusinessRepository,
    private routeRepo: RouteRepository
  ) {}

  async run(presellerId: number, assignedDate: string): Promise<BusinessActivityForPreseller | null> {
    const route = await this.routeRepo.findAreaForRouteByUserAndDate(presellerId, assignedDate);
    if (!route) return null;
    const activity = await this.activityRepo.findActivityByDateAndUserId(presellerId, assignedDate);
    return this.businessRepo.getBusinessesActivityForPreseller(route, activity);
  }
}