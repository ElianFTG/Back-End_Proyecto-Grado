import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";

export class GetClients {
    constructor(private repository: ClientRepository) {}
    
    async run(onlyActive: boolean = true): Promise<Client[]> {
      return this.repository.getAll(onlyActive);
    }
}