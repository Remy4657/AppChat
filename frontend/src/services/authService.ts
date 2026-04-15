import api from "@/lib/axios";

export const authService = {
  signUp: async (
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string
  ) => {
    const res = await api.post("/auth/signup", {
      firstname,
      lastname,
      username,
      email,
      password,
    });

    return res?.data;
  },
  signIn: async (username: string, password: string) => {
    const res = await api.post("/auth/signin", { username, password });

    return res?.data;
  },
  signOut: async () => {
    const res = await api.post("/auth/signout");

    return res?.data;
  },
  fetchMe: async () => {
    const res = await api.get("/users/me");
    return res?.data;
  },
  refreshToken: async () => {
    const res = await api.post("/auth/refresh");
    return res?.data;
  },
};
