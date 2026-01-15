import { MysqlBusinessTypeRepository } from "../../../infrastructure/repositories/MysqlBusinessTypeRepository";
import { CreateBusinessType } from "../../../application/businessType/CreateBusinessType";
import { GetBusinessTypes } from "../../../application/businessType/GetBusinessTypes";

export class BusinessTypeServiceContainer {
  static get businessType() {
    const repo = new MysqlBusinessTypeRepository();
    return {
      createBusinessType: new CreateBusinessType(repo),
      getBusinessTypes: new GetBusinessTypes(repo),
    };
  }
}
