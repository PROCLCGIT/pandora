// src/features/ui/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Estado inicial para las características de UI
const initialState = {
  sidebarOpen: true,  // Estado inicial del sidebar (abierto)
  theme: 'light',     // Tema predeterminado
};

// Crear slice para la UI con reducers
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Alternar visibilidad del sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    // Establecer visibilidad del sidebar
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    // Cambiar tema
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

// Exportar acciones
export const { toggleSidebar, setSidebarOpen, setTheme } = uiSlice.actions;

// Exportar selectores
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;

// Exportar reducer
export default uiSlice.reducer;