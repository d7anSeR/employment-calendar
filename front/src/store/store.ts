import { configureStore } from "@reduxjs/toolkit";
import dateReducer from "./date.slice";

export const store = configureStore({
  reducer: {
    date: dateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
