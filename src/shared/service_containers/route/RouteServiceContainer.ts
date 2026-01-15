import { MysqlRouteRepository } from "../../../infrastructure/repositories/MysqlRouteRepository";
import { CreateRoute } from "../../../application/route/CreateRoute";
import { FindByIdRoute } from "../../../application/route/FindByIdRoute";
import { FindAreaForRouteByUserAndDate } from "../../../application/route/FindClientsByRouteAndDate";
import { MysqlClientRepository } from "../../../infrastructure/repositories/MysqlClientRepository";

export class RouteServiceContainer {
  static get route() {
    const routeRepo = new MysqlRouteRepository();
    const clientRepo = new MysqlClientRepository();

    return {
      createRoute: new CreateRoute(routeRepo),
      findByIdRoute: new FindByIdRoute(routeRepo),
      findAreaForRouteByUserAndDate: new FindAreaForRouteByUserAndDate(routeRepo),
      
    };
  }
}
