import api from "./api";
import { ServiceFee, User } from "../types";

export const settingsService = {
  // Service Fees
  getServiceFees: async (): Promise<ServiceFee[]> => {
    const response = await api.get("/settings/service-fees");
    return response.data;
  },

  createServiceFee: async (data: Partial<ServiceFee>): Promise<ServiceFee> => {
    const response = await api.post("/settings/service-fees", data);
    return response.data;
  },

  updateServiceFee: async (
    id: string,
    data: Partial<ServiceFee>,
  ): Promise<ServiceFee> => {
    const response = await api.put(`/settings/service-fees/${id}`, data);
    return response.data;
  },

  deleteServiceFee: async (id: string): Promise<void> => {
    await api.delete(`/settings/service-fees/${id}`);
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/settings/users");
    return response.data;
  },

  updateProfile: async (profilePicture: string | null): Promise<User> => {
    const response = await api.put("/settings/profile", {
      profilePicture,
    });
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/settings/users/${id}`, data);
    return response.data;
  },

  createUser: async (
    email: string,
    fullName: string,
    password: string,
    role: string,
  ): Promise<User> => {
    const response = await api.post("/auth/admin/create-user", {
      email,
      fullName,
      password,
      role,
    });
    return response.data;
  },
};
