import { MysqlClientTypeRepository } from "../../../infrastructure/repositories/MysqlClientTypeRepository";
import { CreateClientType } from "../../../application/clientType/CreateClientType";
import { GetClientTypes } from "../../../application/clientType/GetClientTypes";

export class ClientTypeServiceContainer {
  static get clientType() {
    const repo = new MysqlClientTypeRepository();
    return {
      createClientType: new CreateClientType(repo),
      getClientTypes: new GetClientTypes(repo),
    };
  }
}
