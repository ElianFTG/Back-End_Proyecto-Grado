import { ClientType } from "../../domain/clientType/ClientType";
import { ClientTypeRepository } from "../../domain/clientType/ClientTypeRepository";

export class GetClientTypes{
    constructor(private repository: ClientTypeRepository){}
    async run(): Promise<ClientType[]>{
        return this.repository.getAll();
    }
}