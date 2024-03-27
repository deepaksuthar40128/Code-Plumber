import { configureStore } from "@reduxjs/toolkit";
import compilerSlice from "./slices/compilerSlice";
import editorSlice from "./slices/editorConfigSlice"
import { api } from "./slices/api"; 

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    compilerSlice, 
    editorSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
