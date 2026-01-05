import { Color } from "../../domain/color/Color";
import { ColorRepository } from "../../domain/color/ColorRepository";

export class CreateColor {
    constructor(private colorRepository: ColorRepository) {}

    async run(name: string, userId: number): Promise<Color | null> {
        const color = new Color(name, userId);
        return this.colorRepository.create(color);
    }
}
