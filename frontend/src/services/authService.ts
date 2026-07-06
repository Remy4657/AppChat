import api from "@/lib/axios";
import axios from "axios";
export const authService = {
  signUp: async (
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
    otp: string,
  ) => {
    const res = await api.post("/auth/signup", {
      firstname,
      lastname,
      username,
      email,
      password,
      otp,
    });

    return res?.data;
  },
  sendOtp: async (
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
  ) => {
    const res = await api.post("/otp/generate", {
      firstname,
      lastname,
      username,
      email,
      password,
    });

    return res?.data;
  },
  signIn: async (username: string, password: string) => {
    //const res = await api.post("/auth/signin", { username, password });
    const res = await axios.post("/api/auth/sign-in", { username, password });
    return res?.data;
  },
  signInGoogle: async (googleIdToken: string) => {
    const res = await api.post(
      "/auth/signin-google",
      {},
      {
        headers: {
          Authorization: `Bearer ${googleIdToken}`,
        },
      },
    );

    return res?.data;
  },
  signOut: async () => {
    //const res = await api.post("/auth/signout");
    const res = await axios.post("/api/auth/sign-out");
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
