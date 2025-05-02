// pandora/src/modulos/basic/categorias/detalleCategoria.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, FileEdit, List, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Función para obtener categoría por ID con detalles
const fetchCategoriaDetalle = async (id) => {
  try {
    const response = await axios.get(`/api/basic/categorias/${id}/hijos/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles de categoría:', error);
    throw error.response?.data?.detail || error.message || 'Error al cargar los detalles de la categoría';
  }
};

export default function DetalleCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Obtener datos detallados de la categoría - Actualizado a React Query v5
  const { data: categoria, isLoading, isError, error } = useQuery({
    queryKey: ['categoriaDetalle', id],
    queryFn: () => fetchCategoriaDetalle(id),
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error al cargar datos</CardTitle>
            <CardDescription>No se pudo cargar la información de la categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error?.message || 'Error desconocido'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/basic/categorias')} variant="outline">
              Volver a categorías
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/basic/categorias')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a categorías
      </Button>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {categoria?.nombre}
                {categoria?.is_active ? (
                  <Badge className="ml-2 bg-green-500">Activo</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">Inactivo</Badge>
                )}
              </CardTitle>
              <CardDescription>Detalles de la categoría</CardDescription>
            </div>
            <Button onClick={() => navigate(`/basic/categorias/edit/${id}`)}>
              <FileEdit className="mr-2 h-4 w-4" /> Editar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Información básica</h3>
                <dl className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Nombre</dt>
                    <dd>{categoria?.nombre}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Código</dt>
                    <dd className="font-mono">{categoria?.code}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Estado</dt>
                    <dd>
                      {categoria?.is_active ? (
                        <Badge className="bg-green-500">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Estructura jerárquica</h3>
                <dl className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Nivel</dt>
                    <dd>{categoria?.level}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Categoría padre</dt>
                    <dd>
                      {categoria?.parent ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/basic/categorias/${categoria.parent}`)}
                        >
                          {categoria.parent_name || 'Ver padre'}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">Categoría raíz</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Ruta</dt>
                    <dd className="font-mono text-xs bg-muted p-1 rounded max-w-xs truncate">
                      {categoria?.path}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Subcategorías</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/basic/categorias/add', {
                  state: { parentId: categoria.id }
                })}
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar subcategoría
              </Button>
            </div>
            
            {categoria?.hijos?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoria.hijos.map((hijo) => (
                    <TableRow key={hijo.id}>
                      <TableCell className="font-medium">{hijo.nombre}</TableCell>
                      <TableCell className="font-mono">{hijo.code}</TableCell>
                      <TableCell>{hijo.level}</TableCell>
                      <TableCell>
                        {hijo.is_active ? (
                          <Badge className="bg-green-500">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/basic/categorias/${hijo.id}`)}
                        >
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <List className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Esta categoría no tiene subcategorías</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}