import { MysqlActivityRepository } from "../../../infrastructure/repositories/MysqlActivityRepository";
import { MysqlActivityDetailRepository } from "../../../infrastructure/repositories/MysqlActivityDetailRepository";
import { MysqlRejectionRepository } from "../../../infrastructure/repositories/MysqlRejectionRepository";
import { MysqlBusinessRepository } from "../../../infrastructure/repositories/MysqlBusinessRepository";
import { MysqlRouteRepository } from "../../../infrastructure/repositories/MysqlRouteRepository";
import { CreateActivity } from "../../../application/activity/CreateActivity";
import { CreateActivityDetail } from "../../../application/activity/CreateActivityDetail";
import { GetBusinessesActivityForPreseller } from "../../../application/activity/GetBusinessesActivityForPreseller";
import { MysqlPresaleRepository } from "../../../infrastructure/repositories/MysqlPresaleRepository";
import { GetBusinessesActivityForDistributor } from "../../../application/activity/GetBusinessesActivityForDistributor";
import { GetActivityByDateAndUserId } from "../../../application/activity/GetActivityByDateAndUserId";

const activityRepository = new MysqlActivityRepository();
const activityDetailRepository = new MysqlActivityDetailRepository();
const rejectionRepository = new MysqlRejectionRepository();
const businessRepository = new MysqlBusinessRepository();
const routeRepository = new MysqlRouteRepository();
const presaleRepository = new MysqlPresaleRepository();

export const ActivityServiceContainer = {
  activity: {
    createActivity: new CreateActivity(activityRepository),
    createActivityDetail: new CreateActivityDetail(activityDetailRepository),
    getBusinessesActivityForPreseller: new GetBusinessesActivityForPreseller(activityRepository, businessRepository, routeRepository),
    getBusinessesActivityForDistributor: new GetBusinessesActivityForDistributor(activityRepository, businessRepository, presaleRepository),
    getActivityByDateAndUserId: new GetActivityByDateAndUserId(activityRepository),
  },
};