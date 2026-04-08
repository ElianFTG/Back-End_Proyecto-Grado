import { BusinessRepository } from "../../domain/business/BusinessRepository";
import { Position } from "../../domain/customs/Position";


export class GetDistanceInMetersBetweenPoints{
    constructor(
        private repo: BusinessRepository
    ){}

    async run(businessId: number, point: Position) : Promise<any | null> {
        return this.repo.getDistanceInMetersBetweenPoints(businessId, point);
    }
}