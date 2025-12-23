import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";

export class CreateClient {
    constructor(private repository: ClientRepository) {}
    
    async run(client: Client, userId: number): Promise<Client | null> {
      return this.repository.create(client, userId);
    }
}
