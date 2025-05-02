// src/store.js
import { configureStore } from '@reduxjs/toolkit';

// Aquí puedes importar tus reducers
// import exampleReducer from './features/example/exampleSlice';

export const store = configureStore({
  reducer: {
    // Añade tus reducers aquí
    // example: exampleReducer,
  },
  // Configuración opcional
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
