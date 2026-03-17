import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";

import { ActivityDetailRepository } from "../../domain/activity/ActivityRepository";
import { Activity, ActivityDetail } from "../../domain/activity/Activity";
import { ActivityEntity } from "../persistence/typeorm/entities/ActivityEntity";
import { ActivityDetailEntity } from "../persistence/typeorm/entities/ActivityDetailEntity";

export class MysqlActivityDetailRepository implements ActivityDetailRepository {
  private readonly repo: Repository<ActivityDetailEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ActivityDetailEntity);
  }

  private toDomain(row: ActivityDetailEntity): ActivityDetail {
    return new ActivityDetail(
        row.action,
        row.activity_id,
        row.business_id,
        row.rejection_id,
        row.id,
    );
  }

  async createActivityDetail(activityDetail: ActivityDetail, activityId: number): Promise<ActivityDetail | null> {
    try {
      const saved = await this.repo.save({
        action: activityDetail.action,
        activity_id: activityId,
        business_id: activityDetail.businessId,
        rejection_id: activityDetail.rejectionId,
      });
      const created = await this.repo.findOneBy({ id: saved.id } as any);
      return created ? this.toDomain(created) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findByActivityId(activityId: number): Promise<ActivityDetail[]> {
    try {
      const rows = await this.repo.findBy({ activity_id: activityId } as any);
      return rows.map((r) => this.toDomain(r));
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
