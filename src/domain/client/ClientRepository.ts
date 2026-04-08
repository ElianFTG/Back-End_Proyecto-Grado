import { Client } from "./Client";

export interface SearchClientsParams {
  search?: string;
  limit?: number;
}

export interface ClientRepository {
  create(client: Client, userId: number | null): Promise<Client | null>;
  getAll(): Promise<Client[]>;
  findById(id: number): Promise<Client | null>;
  update(id: number, client: Partial<Client>, userId: number | null): Promise<Client | null>;
  softDelete(id: number, userId: number | null): Promise<boolean>;
  search(params: SearchClientsParams): Promise<Client[]>;
}

