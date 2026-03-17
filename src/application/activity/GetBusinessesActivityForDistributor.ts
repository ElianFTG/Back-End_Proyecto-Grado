import { ActivityRepository } from "../../domain/activity/ActivityRepository";
import { BusinessRepository } from "../../domain/business/BusinessRepository";
import { PresaleRepository } from "../../domain/presale/PresaleRepository";
import { BusinessActivityForPreseller } from "../../domain/customs/ActivityWork";

export class GetBusinessesActivityForDistributor {
  constructor(
    private activityRepo: ActivityRepository,
    private businessRepo: BusinessRepository,
    private presaleRepo: PresaleRepository
  ) {}

  async run(distributorId: number, deliveryDate: string): Promise<BusinessActivityForPreseller | null> {
    const businessIds = await this.presaleRepo.findBusinessIdsByDistributorAndDate(distributorId, deliveryDate);
    if (!businessIds.length) return null;
    const activity = await this.activityRepo.findByPreseller(distributorId, deliveryDate);
    return this.businessRepo.getBusinessesActivityForDistributor(businessIds, activity);
  }
}