import { ColorRepository } from "../../domain/color/ColorRepository";

export class UpdateStateColor {
    constructor(private colorRepository: ColorRepository) {}

    async run(id: number, userId: number): Promise<void> {
        return this.colorRepository.updateState(id, userId);
    }
}
