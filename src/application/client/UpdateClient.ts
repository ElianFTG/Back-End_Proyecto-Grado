import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";

export class UpdateClient {
    constructor(private repository: ClientRepository) {}
    
    async run(id: number, client: Partial<Client>, userId: number): Promise<Client | null> {
      return this.repository.update(id, client, userId);
    }
}
