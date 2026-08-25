import { httpClient } from "@shared/services/httpClient";

import type { ILoginDto, IAuthResponse } from "../adapters/AuthAdapter";

export const authService = {
  login: async (credentials: ILoginDto): Promise<IAuthResponse> => {
    const response = await httpClient.post("", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await httpClient.post("");
  },

  getCurrentUser: async (): Promise<IAuthResponse> => {
    const response = await httpClient.get("");
    return response.data;
  },
};
