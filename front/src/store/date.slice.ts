import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  addWeeks,
  subWeeks,
  startOfWeek,
  addMonths,
  subMonths,
  startOfMonth,
} from "date-fns";

interface DateState {
  currentDate: string;
  selectedDate: string;
  currentWeek: string;
}

const initialState: DateState = {
  currentDate: new Date().toISOString(),
  selectedDate: new Date().toISOString(),
  currentWeek: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
};

export const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    setCurrentDate: (state, action: PayloadAction<Date>) => {
      state.currentDate = action.payload.toISOString();
    },
    setSelectedDate: (state, action: PayloadAction<Date>) => {
      state.selectedDate = action.payload.toISOString();
    },
    goToToday: (state) => {
      const today = new Date();
      state.currentDate = today.toISOString();
      state.selectedDate = today.toISOString();
      state.currentWeek = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
    },
    goToNextWeek: (state) => {
      const currentWeek = new Date(state.currentWeek);
      const nextWeek = addWeeks(currentWeek, 1);
      state.currentWeek = nextWeek.toISOString();
      state.selectedDate = nextWeek.toISOString();
      state.currentDate = startOfMonth(nextWeek).toISOString();
    },
    goToPrevWeek: (state) => {
      const currentWeek = new Date(state.currentWeek);
      const prevWeek = subWeeks(currentWeek, 1);
      state.currentWeek = prevWeek.toISOString();
      state.selectedDate = prevWeek.toISOString();
      state.currentDate = startOfMonth(prevWeek).toISOString();
    },
    setCurrentWeek: (state, action: PayloadAction<Date>) => {
      state.currentWeek = action.payload.toISOString();
    },
    selectDateAndWeek: (state, action: PayloadAction<Date>) => {
      const selectedDate = action.payload;
      state.selectedDate = selectedDate.toISOString();
      state.currentWeek = startOfWeek(selectedDate, {
        weekStartsOn: 1,
      }).toISOString();
      state.currentDate = startOfMonth(selectedDate).toISOString();
    },
    goToNextMonth: (state) => {
      const currentDate = new Date(state.currentDate);
      const nextMonth = addMonths(currentDate, 1);
      state.currentDate = nextMonth.toISOString();
    },
    goToPrevMonth: (state) => {
      const currentDate = new Date(state.currentDate);
      const prevMonth = subMonths(currentDate, 1);
      state.currentDate = prevMonth.toISOString();
    },
  },
});

export const {
  setCurrentDate,
  setSelectedDate,
  goToToday,
  goToNextWeek,
  goToPrevWeek,
  setCurrentWeek,
  selectDateAndWeek,
  goToNextMonth,
  goToPrevMonth,
} = dateSlice.actions;

export const selectCurrentDate = (state: { date: DateState }) =>
  new Date(state.date.currentDate);
export const selectSelectedDate = (state: { date: DateState }) =>
  new Date(state.date.selectedDate);
export const selectCurrentWeek = (state: { date: DateState }) =>
  new Date(state.date.currentWeek);

export default dateSlice.reducer;
