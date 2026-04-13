import api from "@/lib/axios";

export const authService = {
  signUp: async (
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/auth/signup",
      { firstname, lastname, username, password, email },
      { withCredentials: true }
    );

    return res?.data;
  },
};
