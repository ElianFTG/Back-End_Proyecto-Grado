import { Route } from "../../domain/route/Route";
import { RouteRepository } from "../../domain/route/RouteRepository";


export class FindAreaForRouteByUserAndDate{
    constructor(
        private repo: RouteRepository
    ) {}

    async run(userId: number, assignedDate: string): Promise<Route | null> {
        return this.repo.findAreaForRouteByUserAndDate(userId, assignedDate); 
    } 
}