import { MysqlActivityRepository } from "../../../infrastructure/repositories/MysqlActivityRepository";
import { CreateActivity } from "../../../application/activity/CreateActivity";

export class ActivityServiceContainer {
  static get activity() {
    const repo = new MysqlActivityRepository();
    return {
      createActivity: new CreateActivity(repo),
    };
  }
}
