import { Presentation } from "../../domain/presentation/Presentation";
import { PresentationRepository } from "../../domain/presentation/PresentationRepository";

export class CreatePresentation {
    constructor(private presentationRepository: PresentationRepository) {}

    async run(name: string, userId: number): Promise<Presentation | null> {
        const presentation = new Presentation(name, userId);
        return this.presentationRepository.create(presentation);
    }
}
