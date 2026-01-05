import { Presentation } from "../../domain/presentation/Presentation";
import { PresentationRepository } from "../../domain/presentation/PresentationRepository";

export class UpdatePresentation {
    constructor(private presentationRepository: PresentationRepository) {}

    async run(id: number, data: Partial<Presentation>, userId: number): Promise<Presentation | null> {
        return this.presentationRepository.update(id, data, userId);
    }
}
