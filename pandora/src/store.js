// src/store.js
import { configureStore } from '@reduxjs/toolkit';

// Importar reducers
import uiReducer from './features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    // Añadir reducers al store
    ui: uiReducer,
  },
  // Configuración opcional
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
