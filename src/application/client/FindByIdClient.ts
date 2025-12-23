import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";

export class FindByIdClient {
    constructor(private repository: ClientRepository) {}
    
    async run(id: number): Promise<Client | null> {
      return this.repository.findById(id);
    }
}
