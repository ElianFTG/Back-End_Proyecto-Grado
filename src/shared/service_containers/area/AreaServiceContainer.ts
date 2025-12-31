import { MysqlAreaRepository } from "../../../infrastructure/repositories/MysqlAreaRepository";
import { CreateArea } from "../../../application/area/CreateArea";
import { GetAreas } from "../../../application/area/GetAreas";
import { FindByIdArea } from "../../../application/area/FindByIdArea";
import { UpdateArea } from "../../../application/area/UpdateArea";
import { SoftDeleteArea } from "../../../application/area/SoftDeleteArea";

export class AreaServiceContainer {
  static get area() {
    const repo = new MysqlAreaRepository();
    return {
      createArea: new CreateArea(repo),
      getAreas: new GetAreas(repo),
      findByIdArea: new FindByIdArea(repo),
      updateArea: new UpdateArea(repo),
      softDeleteArea: new SoftDeleteArea(repo),
    };
  }
}
