import { ActivityDetail } from "../../domain/activity/Activity";
import { ActivityDetailRepository } from "../../domain/activity/ActivityRepository";

export class CreateActivityDetail {
  constructor(private repo: ActivityDetailRepository) {}

  async run(activityDetail: ActivityDetail, activityId: number): Promise<ActivityDetail | null> {
    if( !activityId ) throw Error("Es obligatorio ingresar id de la actividad")
    return this.repo.createActivityDetail(activityDetail, activityId);
  }
}
