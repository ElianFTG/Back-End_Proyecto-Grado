import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";

export class GetClients {
    constructor(private repository: ClientRepository) {}
    
    async run(): Promise<Client[]> {
      return this.repository.getAll();
    }
}