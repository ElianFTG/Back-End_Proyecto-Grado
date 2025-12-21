
export class Category {
    id?: number | undefined;
    name: string;
    description: string;
    state: boolean;
    userId: number;

    constructor(
        name: string,
        description: string,
        userId: number,
        state: boolean = true,
        id?: number
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.state = state;
        this.userId = userId;
    }
}
