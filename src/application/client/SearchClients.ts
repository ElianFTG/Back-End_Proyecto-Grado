import { Client } from "../../domain/client/Client";
import { ClientRepository, SearchClientsParams } from "../../domain/client/ClientRepository";

/**
 * SearchClients - Caso de uso para buscar clientes de forma dinámica
 * 
 * Permite buscar clientes por nombre, apellido paterno, apellido materno o CI
 * Retorna un máximo de N resultados (por defecto 10)
 * 
 * Uso desde móvil/frontend:
 * GET /clients/search?q=Juan&limit=10
 * 
 * Response: Array de clientes que coinciden con la búsqueda
 */
export class SearchClients {
    constructor(private repository: ClientRepository) {}
    
    async run(params: SearchClientsParams): Promise<Client[]> {
        return this.repository.search(params);
    }
}
