import { MysqlPriceTypeRepository } from "../../../infrastructure/repositories/MysqlPriceTypeRepository";
import { CreatePriceType } from "../../../application/priceType/CreatePriceType";
import { GetPriceTypes } from "../../../application/priceType/GetPriceTypes";

export class PriceTypeServiceContainer {
  static get priceType() {
    const repo = new MysqlPriceTypeRepository();
    return {
      createPriceType: new CreatePriceType(repo),
      getPriceTypes: new GetPriceTypes(repo),
    };
  }
}
