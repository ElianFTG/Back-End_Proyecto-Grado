import { MysqlActivityRepository } from "../../../infrastructure/repositories/MysqlActivityRepository";
import { MysqlActivityDetailRepository } from "../../../infrastructure/repositories/MysqlActivityDetailRepository";
import { MysqlRejectionRepository } from "../../../infrastructure/repositories/MysqlRejectionRepository";
import { CreateActivity } from "../../../application/activity/CreateActivity";
import { CreateActivityDetail } from "../../../application/activity/CreateActivityDetail";

const activityRepository = new MysqlActivityRepository();
const activityDetailRepository = new MysqlActivityDetailRepository();
const rejectionRepository = new MysqlRejectionRepository();

export const ActivityServiceContainer = {
  activity: {
    createActivity: new CreateActivity(activityRepository),
    createActivityDetail: new CreateActivityDetail(activityDetailRepository),
  },
};