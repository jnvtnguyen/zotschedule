import { create, useStore } from "zustand";
import { createContext, useContext } from "react";
import { View } from "react-big-calendar";

type ScheduleCalendarState = {
  view: View;
  setView: (view: View) => void;
};

export const createScheduleCalendarStore = (initialView: View) => {
  return create<ScheduleCalendarState>((set) => ({
    view: initialView,
    setView: (view) => set({ view }),
  }));
};

export type ScheduleCalendarStore = ReturnType<
  typeof createScheduleCalendarStore
>;

export const ScheduleCalendarContext =
  createContext<ScheduleCalendarStore | null>(null);

export function useScheduleCalendarContext<T>(
  selector: (state: ScheduleCalendarState) => T,
) {
  const store = useContext(ScheduleCalendarContext);
  if (!store) {
    throw new Error("Missing ScheduleCalendarContext.Provider in the tree");
  }
  return useStore(store, selector);
}
