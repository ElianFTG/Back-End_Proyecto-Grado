import { MysqlBusinessRepository } from "../../../infrastructure/repositories/MysqlBusinessRepository";
import { CreateBusiness } from "../../../application/business/CreateBusiness";
import { GetBusinesses } from "../../../application/business/GetBusinesses";
import { FindByIdBusiness } from "../../../application/business/FindByIdBusiness";
import { UpdateBusiness } from "../../../application/business/UpdateBusiness";
import { SoftDeleteBusiness } from "../../../application/business/SoftDeleteBusiness";

import { RouteRepository } from "../../../domain/route/RouteRepository";
import { GetBusinessActivitiesByRoute } from "../../../application/business/GetBusinessActivityByRoute";
import { MysqlRouteRepository } from "../../../infrastructure/repositories/MysqlRouteRepository";

export class BusinessServiceContainer {
  static get business() {
    const repo = new MysqlBusinessRepository();
    const routeRepo = new MysqlRouteRepository()
    return {
      createBusiness: new CreateBusiness(repo),
      getBusinesses: new GetBusinesses(repo),
      findByIdBusiness: new FindByIdBusiness(repo),
      updateBusiness: new UpdateBusiness(repo),
      softDeleteBusiness: new SoftDeleteBusiness(repo),

      getBusinessActivitiesByRoute : new GetBusinessActivitiesByRoute(repo, routeRepo)
    };
  }
}
