import { Client } from "../../domain/client/Client";
import { ClientRepository } from "../../domain/client/ClientRepository";

export class CreateClient {
  constructor(private repo: ClientRepository) {}
  async run(client: Client, userId: number | null): Promise<Client | null> {
    return this.repo.create(client, userId);
  }
}