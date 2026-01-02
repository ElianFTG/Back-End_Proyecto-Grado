import { Color } from "../../domain/color/Color";
import { ColorRepository } from "../../domain/color/ColorRepository";

export class UpdateColor {
    constructor(private colorRepository: ColorRepository) {}

    async run(id: number, data: Partial<Color>, userId: number): Promise<Color | null> {
        return this.colorRepository.update(id, data, userId);
    }
}
