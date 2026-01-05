import { RouteRepository } from "../../domain/route/RouteRepository";
import { ClientRepository } from "../../domain/client/ClientRepository";
import { Client } from "../../domain/client/Client";


export class GetClientsByRouteUserDate{
    constructor(
        private routeRepo: RouteRepository,
        private clientRepo: ClientRepository
    ) {}

    async run(userId: number, assignedDate: string): Promise<Client[]> {
        const idArea = await this.routeRepo.findAreaForRouteByUserAndDate(userId, assignedDate);
        if(!idArea) return [];
        return this.clientRepo.getClientsByArea(idArea)
    } 
}