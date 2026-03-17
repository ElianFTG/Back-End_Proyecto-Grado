import { ActivityDetail } from "../../domain/activity/Activity";
import { ActivityDetailRepository } from "../../domain/activity/ActivityRepository";

export class CreateActivityDetail {
  constructor(private repo: ActivityDetailRepository) {}

  async run(activityDetail: ActivityDetail, activityId: number): Promise<ActivityDetail | null> {
    return this.repo.createActivityDetail(activityDetail, activityId);
  }
}
