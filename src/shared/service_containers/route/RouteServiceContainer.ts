import { MysqlRouteRepository } from "../../../infrastructure/repositories/MysqlRouteRepository";
import { CreateRoute } from "../../../application/route/CreateRoute";
import { FindByIdRoute } from "../../../application/route/FindByIdRoute";

export class RouteServiceContainer {
  static get route() {
    const repo = new MysqlRouteRepository();
    return {
      createRoute: new CreateRoute(repo),
      findByIdRoute: new FindByIdRoute(repo),
    };
  }
}
