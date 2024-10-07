import { createContext, useContext } from "react";
import { create, useStore } from "zustand";

import { ScheduleActionsPanelSearchValues } from "./search-tab/filters";

type ScheduleActionsPanelContextState = {
  term: string;
  setTerm: (term: string) => void;
  search?: ScheduleActionsPanelSearchValues;
  setSearch: (search?: ScheduleActionsPanelSearchValues) => void;
};

export const createScheduleActionsPanelStore = ({ term }: { term: string }) => {
  return create<ScheduleActionsPanelContextState>((set) => ({
    term,
    setTerm: (term) => set({ term }),
    setSearch: (search) => set({ search }),
  }));
};

export type ScheduleActionsPanelStore = ReturnType<
  typeof createScheduleActionsPanelStore
>;

export const ScheduleActionsPanelContext =
  createContext<ScheduleActionsPanelStore | null>(null);

export function useScheduleActionsPanel<T>(
  selector: (state: ScheduleActionsPanelContextState) => T,
) {
  const store = useContext(ScheduleActionsPanelContext);
  if (!store) {
    throw new Error("Missing ScheduleActionsPanelContext.Provider in the tree");
  }
  return useStore(store, selector);
}
