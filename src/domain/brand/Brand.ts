export class Brand {
    id?: number | undefined;
    name: string;
    state: boolean;
    userId: number;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;

    constructor(
        name: string,
        userId: number,
        state: boolean = true,
        id?: number,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this.id = id;
        this.name = name;
        this.state = state;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
