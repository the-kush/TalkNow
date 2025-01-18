import { create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import {toast} from "react-hot-toast/headless";


export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
        } catch (e) {
            console.error("Error in checkAuth", e);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try{
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
        } catch (e) {
            toast.error(e.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Account login successfully");
        } catch (e) {
            toast.error(e.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Account logged out successfully");
        } catch (e) {
            toast.error(e.response.data.message);
        }
    },

    updateProfile: async (data) => {
      set({ isUpdatingProfile: true });
      try {
          const res = await axiosInstance.put("/auth/updateProfile", data);
          set({ authUser: res.data });
          toast.success("Account updated successfully");
      } catch (e) {
            toast.error(e.response.data.message);
      } finally {
          set({ isUpdatingProfile: false });
      }
    },


}))