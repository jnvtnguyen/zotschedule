import { createContext, useContext } from "react";
import { create, useStore } from "zustand";

import { WebSocResponse } from "@/lib/uci/offerings/types";

type SideViewContextState = {
  term: string;
  setTerm: (term: string) => void;
  offerings?: WebSocResponse;
  setOfferings: (offerings?: WebSocResponse) => void;
};

export const createSideViewStore = ({ term }: { term: string }) => {
  return create<SideViewContextState>((set) => ({
    term,
    setTerm: (term) => set({ term }),
    setOfferings: (offerings) => set({ offerings }),
  }));
};

export type SideViewStore = ReturnType<typeof createSideViewStore>;

export const SideViewContext = createContext<SideViewStore | null>(null);

export function useSideViewContext<T>(
  selector: (state: SideViewContextState) => T,
) {
  const store = useContext(SideViewContext);
  if (!store) {
    throw new Error("Missing SideViewContext.Provider in the tree");
  }
  return useStore(store, selector);
}
