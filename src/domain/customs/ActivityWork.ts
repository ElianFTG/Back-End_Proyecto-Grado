import { Activity, ActivityDetail } from "../activity/Activity";
import { Business } from "../business/Business";

export type ActivityWork = {
  business: Partial<Business>;
  activity: Partial<Activity>;
};

export type BusinessWithDetail = {
  business: Partial<Business>;
  activityDetail: Partial<ActivityDetail> | null;
};

export type BusinessActivityForPreseller = {
  activity: Partial<Activity> | null;
  businesses: BusinessWithDetail[];
};