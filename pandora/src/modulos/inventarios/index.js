// Páginas
export { default as InventoryDashboard } from './pages/InventoryDashboard';
export { default as MovementsPage } from './pages/MovementsPage';
export { default as ReportsPage } from './pages/ReportsPage';

// Componentes
export { default as InventoryTable } from './components/InventoryTable';
export { default as StockOverview } from './components/StockOverview';
export { default as StockAlerts } from './components/StockAlerts';
export { default as MovementForm } from './components/MovementForm';
export { default as MovementHistory } from './components/MovementHistory';

// Hooks
export { useInventory } from './hooks/useInventory';
export { useMovements } from './hooks/useMovements';
export { useStockAlerts } from './hooks/useStockAlerts';

// Servicios
export { default as InventoryService } from './services/inventoryService';

// API
export { inventoryApi } from './api/inventoryApi';

// Constantes
export * from './constants/inventoryConstants';

// Utils
export * from './utils/formatters';
