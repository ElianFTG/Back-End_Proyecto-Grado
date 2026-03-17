import { MysqlActivityRepository } from "../../../infrastructure/repositories/MysqlActivityRepository";
import { CreateActivity } from "../../../application/activity/CreateActivity";

const activityRepository = new MysqlActivityRepository();

export const ActivityServiceContainer = {
  activity: {
    createActivity: new CreateActivity(activityRepository)
  }
}
