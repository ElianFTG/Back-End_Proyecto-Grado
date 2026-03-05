
export class User {
    id?: number | undefined;
    ci: string;
    names: string;
    lastName: string;
    secondLastName: string | null;
    email: string;
    role: string;
    branchId: number | null;
    userName: string;
    isFirstLogin: boolean;

    constructor(
        ci: string,
        names: string,
        lastName: string,
        secondLastName: string | null,
        email: string,
        role: string,
        branchId: number | null,
        userName: string,
        isFirstLogin: boolean = true,
        id?: number,
    ){
        this.id = id;
        this.ci = ci;
        this.names = names;
        this.lastName = lastName;
        this.secondLastName = secondLastName;
        this.email = email;
        this.role = role;
        this.branchId = branchId;
        this.userName = userName;
        this.isFirstLogin = isFirstLogin;
    }
}
