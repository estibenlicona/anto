import { IUser } from "../models/IUser";
import { UserEntity } from "../models/User";

export interface ILoginDto {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

export const authAdapter = {
  toEntity: (response: IAuthResponse) => {
    const { id, name, email, role } = response.user;
    return new UserEntity(id, email, name, role);
  },

  toDto: (email: string, password: string): ILoginDto => {
    return { email, password };
  },
};
