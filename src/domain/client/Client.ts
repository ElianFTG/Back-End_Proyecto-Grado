export class Client {
  id?: number| undefined;
  name: string;
  lastName: string;
  secondLastName: string | null;
  phone: string;
  ci: string | null;

  constructor(
    name: string,
    lastName: string,
    secondLastName: string | null,
    phone: string,
    ci: string | null,
    id?: number
  ) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.secondLastName = secondLastName;
    this.phone = phone;
    this.ci = ci;
  }
}
