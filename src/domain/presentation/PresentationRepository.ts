import { Presentation } from "./Presentation";

export interface PresentationRepository {
    getAll(): Promise<Presentation[]>;
    create(presentation: Presentation): Promise<Presentation | null>;
    findById(id: number): Promise<Presentation | null>;
    update(id: number, presentation: Partial<Presentation>, userId: number): Promise<Presentation | null>;
    updateState(id: number, userId: number): Promise<void>;
}
