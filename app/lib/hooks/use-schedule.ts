import { create, useStore } from "zustand";
import { createContext, useContext } from "react";

import { Schedule } from "@/lib/database/types";

type ScheduleState = {
  schedule?: Schedule;
  setSchedule: (schedule?: Schedule) => void;
};

export const createScheduleStore = (initialSchedule?: Schedule) => {
  return create<ScheduleState>((set) => ({
    schedule: initialSchedule,
    setSchedule: (schedule) => set({ schedule }),
  }));
};

export type ScheduleStore = ReturnType<typeof createScheduleStore>;

export const ScheduleContext = createContext<ScheduleStore | null>(null);

export function useScheduleContext<T>(selector: (state: ScheduleState) => T) {
  const store = useContext(ScheduleContext);
  if (!store) {
    throw new Error("Missing ScheduleContext.Provider in the tree");
  }
  return useStore(store, selector);
}
