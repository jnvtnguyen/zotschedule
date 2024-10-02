import { create, useStore } from "zustand";
import { createContext, useContext } from "react";

import { AuthUser } from "@/lib/auth";

type AuthUserState = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
};

export const createAuthUserStore = (initialUser: AuthUser) => {
  return create<AuthUserState>((set) => ({
    user: initialUser,
    setUser: (user) => set({ user }),
  }));
};

export type AuthUserStore = ReturnType<typeof createAuthUserStore>;

export const AuthUserContext = createContext<AuthUserStore | null>(null);

export function useAuthUserContext<T>(selector: (state: AuthUserState) => T) {
  const store = useContext(AuthUserContext);
  if (!store) {
    throw new Error("Missing AuthUserContext.Provider in the tree");
  }
  return useStore(store, selector);
}
