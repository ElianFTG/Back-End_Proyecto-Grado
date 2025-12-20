
export class User {
    id?: number | undefined;
    ci: string;
    names: string;
    lastName: string;
    secondLastName: string;
    role: string;
    branchId: number | null;
    userName: string

    constructor(
        ci: string,
        names: string,
        lastName: string,
        secondLastName: string,
        role: string,
        branchId: number | null,
        userName: string,
        id?: number,
        
    ){
        this.id = id;
        this.ci = ci;
        this.names = names;
        this.lastName = lastName;
        this.secondLastName = secondLastName;
        this.role = role;
        this.branchId = branchId;
        this.userName = userName;
    }
}
