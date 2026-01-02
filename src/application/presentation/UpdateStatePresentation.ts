import { PresentationRepository } from "../../domain/presentation/PresentationRepository";

export class UpdateStatePresentation {
    constructor(private presentationRepository: PresentationRepository) {}

    async run(id: number, userId: number): Promise<void> {
        return this.presentationRepository.updateState(id, userId);
    }
}
