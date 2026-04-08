import { ClientRepository } from "../../domain/client/ClientRepository";

export class SoftDeleteClient {
    constructor(private repository: ClientRepository) {}

    async run(id: number, userId: number | null ): Promise<boolean> {
      return this.repository.softDelete(id, userId);
    }
}