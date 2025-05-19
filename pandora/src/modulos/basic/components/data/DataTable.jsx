// /pandora/src/modulos/basic/components/data/DataTable.jsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Componente de Paginación
 */
export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  return (
    <div className="flex justify-center items-center pt-4 mt-4 border-t border-blue-100 space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        className="border-blue-200 text-blue-700 hover:bg-blue-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </Button>
      <span className="px-3 py-1 text-sm text-blue-800">
        Página {currentPage} de {totalPages}
      </span>
      <Button 
        variant="outline" 
        size="sm"
        className="border-blue-200 text-blue-700 hover:bg-blue-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </Button>
    </div>
  );
};

/**
 * Componente de Spinner de carga
 */
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

/**
 * Componente de Tarjeta de Error
 */
export const ErrorCard = ({ 
  errorMessage,
  onRetry 
}) => (
  <Card className="border-destructive bg-red-50">
    <CardHeader className="pb-2 bg-red-100 rounded-t-lg">
      <CardTitle className="flex items-center text-lg font-semibold text-red-900">Error</CardTitle>
      <CardDescription className="text-red-700">No se pudieron cargar los datos</CardDescription>
    </CardHeader>
    <CardContent className="pt-5 text-red-800">
      <p>{errorMessage || 'Error desconocido'}</p>
    </CardContent>
    <CardFooter className="flex justify-end bg-red-50/50 py-3 border-t border-red-100">
      <Button onClick={onRetry} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
        Intentar nuevamente
      </Button>
    </CardFooter>
  </Card>
);

/**
 * Componente principal de tabla de datos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.columns - Definición de columnas
 * @param {Array} props.data - Datos a mostrar
 * @param {boolean} props.isLoading - Estado de carga
 * @param {boolean} props.isError - Estado de error
 * @param {string} props.errorMessage - Mensaje de error
 * @param {Function} props.onRetry - Función para reintentar carga
 * @param {Object} props.pagination - Datos de paginación
 * @param {Function} props.renderRow - Función para renderizar una fila
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 */
export const DataTable = ({
  columns,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  pagination,
  renderRow,
  emptyMessage = "No se encontraron datos que coincidan con la búsqueda."
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isError) {
    return <ErrorCard errorMessage={errorMessage} onRetry={onRetry} />;
  }
  
  const { 
    currentPage, 
    totalPages, 
    totalItems, 
    pageSize, 
    onPageChange 
  } = pagination || {};
  
  const startItem = data?.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = data?.length > 0 ? startItem + data.length - 1 : 0;
  
  return (
    <Card className="border-blue-100 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gradient-to-r from-blue-50 to-transparent border-y border-blue-100">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index} 
                    className="py-3 px-4 text-sm font-medium text-blue-800"
                    style={column.style}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? (
                data.map((item, rowIndex) => (
                  renderRow ? (
                    renderRow(item, rowIndex)
                  ) : (
                    <TableRow key={rowIndex} className="hover:bg-blue-50/40 transition-colors">
                      {columns.map((column, colIndex) => (
                        <TableCell 
                          key={colIndex} 
                          className="py-3 px-4 border-b border-blue-100/60"
                        >
                          {column.cell ? column.cell(item) : item[column.accessor]}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="text-center py-10 text-gray-500 italic border-b border-blue-100/60"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {totalItems > 0 && pagination && (
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100/30 py-3 border-t border-blue-100">
          <div className="text-sm text-blue-700 font-medium mb-2 sm:mb-0">
            Mostrando {startItem} - {endItem} de {totalItems} resultados
          </div>
          {totalItems > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </CardFooter>
      )}
    </Card>
  );
};