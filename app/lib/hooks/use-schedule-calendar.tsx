import { create, useStore } from "zustand";
import { createContext, useContext } from "react";
import { View } from "react-big-calendar";

type ScheduleCalendarState = {
  date: Date;
  setDate: (date: Date) => void;
  view: View;
  setView: (view: View) => void;
};

export const createScheduleCalendarStore = (view: View, date: Date) => {
  return create<ScheduleCalendarState>((set) => ({
    view,
    setView: (view) => set({ view }),
    date,
    setDate: (date) => set({ date }),
  }));
};

export type ScheduleCalendarStore = ReturnType<
  typeof createScheduleCalendarStore
>;

export const ScheduleCalendarContext =
  createContext<ScheduleCalendarStore | null>(null);

export function useScheduleCalendar<T>(
  selector: (state: ScheduleCalendarState) => T,
) {
  const store = useContext(ScheduleCalendarContext);
  if (!store) {
    throw new Error("Missing ScheduleCalendarContext.Provider in the tree");
  }
  return useStore(store, selector);
}
