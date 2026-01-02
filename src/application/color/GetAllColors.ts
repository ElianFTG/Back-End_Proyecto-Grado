import { Color } from "../../domain/color/Color";
import { ColorRepository } from "../../domain/color/ColorRepository";

export class GetAllColors {
    constructor(private colorRepository: ColorRepository) {}

    async run(): Promise<Color[]> {
        return this.colorRepository.getAll();
    }
}
