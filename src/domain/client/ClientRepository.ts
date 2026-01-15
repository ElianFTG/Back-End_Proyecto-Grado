import { Client } from "./Client";

export interface ClientRepository {
  create(client: Client, userId: number | null): Promise<Client | null>;
  getAll(): Promise<Client[]>;
  findById(id: number): Promise<Client | null>;
  update(id: number, client: Partial<Client>, userId: number | null): Promise<Client | null>;
  softDelete(id: number, userId: number | null): Promise<boolean>;
}

