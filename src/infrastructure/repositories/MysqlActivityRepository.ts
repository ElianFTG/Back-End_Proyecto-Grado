import { Repository } from "typeorm";
import { AppDataSource } from "../db/Mysql";

import { ActivityRepository } from "../../domain/activity/ActivityRepository";
import { Activity } from "../../domain/activity/Activity";
import { ActivityEntity } from "../persistence/typeorm/entities/ActivityEntity";

export class MysqlActivityRepository implements ActivityRepository {
  private readonly repo: Repository<ActivityEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ActivityEntity);
  }

  private toDomain(row: ActivityEntity): Activity {
    return new Activity(
        row.action,
        row.route_id,
        row.responsible_user_id,
        row.business_id,
        row.rejection_id ?? null,
        row.id,
        row.created_at 
    );
  }

  async create(activity: Activity, userId: number | null): Promise<Activity | null> {
    try {
      const saved = await this.repo.save({
        action: activity.action,
        rejection_id: activity.rejectionId ?? null,
        route_id: activity.routeId,
        responsible_user_id: activity.responsibleUserId,
        business_id: activity.businessId,
        user_id: userId ?? null,
        state: true,
      });
      const created = await this.repo.findOneBy({ id: saved.id } as any);
      return created ? this.toDomain(created) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
