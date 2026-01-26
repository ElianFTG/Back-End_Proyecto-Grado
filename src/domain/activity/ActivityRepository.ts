import { Activity } from "./Activity";

export interface ActivityRepository {
  create(activity: Activity, userId: number | null): Promise<Activity | null>;
}
