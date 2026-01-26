import { Business } from "../../domain/business/Business";
import { BusinessRepository } from "../../domain/business/BusinessRepository";
import { RouteRepository } from "../../domain/route/RouteRepository";
import { Route } from "../../domain/route/Route";
import { ActivityWork } from "../../domain/customs/ActivityWork";
import { IsNull } from "typeorm";

export class GetBusinessActivitiesByRoute{
    constructor(
        private repo: BusinessRepository,
        private routeRepo: RouteRepository
    ){}

    async run(userId: number, date: string) : Promise<ActivityWork[] | []> {
        
        const route = await this.routeRepo.findAreaForRouteByUserAndDate(userId, date);
        if(!route) return [];
        return this.repo.getBusinessActivitiesByRoute(route)
        
    }
}