import { Color } from "../../domain/color/Color";
import { ColorRepository } from "../../domain/color/ColorRepository";

export class FindByIdColor {
    constructor(private colorRepository: ColorRepository) {}

    async run(id: number): Promise<Color | null> {
        return this.colorRepository.findById(id);
    }
}
