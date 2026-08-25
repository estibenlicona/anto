export class UserEntity {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public role: "admin" | "user"
  ) {}

  isAdmin(): boolean {
    return this.role === "admin";
  }
}
