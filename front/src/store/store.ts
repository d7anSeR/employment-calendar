import { configureStore } from "@reduxjs/toolkit";
import dateReducer from "./date.slice";
import { userReducer } from "./user.slice";

export const store = configureStore({
  reducer: {
    date: dateReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
