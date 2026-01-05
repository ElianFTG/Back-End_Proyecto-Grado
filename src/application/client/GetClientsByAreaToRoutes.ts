import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";

export class GetClientsByAreaToRoutes {
    constructor(private repository: ClientRepository) {}
    
    async run(areaId : number): Promise<Client[]> {
      return this.repository.getClientsByArea(areaId);
    }
}