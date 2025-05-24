// /pandora/src/modulos/productos/components/form/DocumentsPanel.jsx

import { useRef } from 'react';
import { FileText, FilePlus, File, Eye, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

/**
 * Componente para el panel de gestión de documentos del producto
 */
export function DocumentsPanel({
  documentos,
  setDocumentos,
  docDialogOpen,
  setDocDialogOpen,
  nuevoDocumento,
  setNuevoDocumento,
  handleDocUpload,
  addDocument,
  removeDocument
}) {
  const docInputRef = useRef(null);

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md rounded-xl h-full">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-amber-500 p-2 rounded-lg mr-3 shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-800">Documentos del Producto</CardTitle>
              <CardDescription className="text-gray-500">
                Documentación técnica y certificados
              </CardDescription>
            </div>
          </div>
          <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-4 bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                <FilePlus className="h-4 w-4 mr-2" />
                Añadir Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Documento</DialogTitle>
                <DialogDescription>
                  Sube un documento y añade los detalles necesarios
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="docFile">Documento <span className="text-red-500">*</span></Label>
                  <Input 
                    id="docFile" 
                    type="file" 
                    ref={docInputRef}
                    onChange={handleDocUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docTipo">Tipo de Documento <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setNuevoDocumento({...nuevoDocumento, tipo_documento: value})} 
                    value={nuevoDocumento.tipo_documento}
                  >
                    <SelectTrigger id="docTipo">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Ficha Técnica">Ficha Técnica</SelectItem>
                      <SelectItem value="Certificado">Certificado</SelectItem>
                      <SelectItem value="Instructivo">Instructivo</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docTitulo">Título <span className="text-red-500">*</span></Label>
                  <Input 
                    id="docTitulo" 
                    placeholder="Título del documento"
                    value={nuevoDocumento.titulo}
                    onChange={(e) => setNuevoDocumento({...nuevoDocumento, titulo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docDescripcion">Descripción</Label>
                  <Textarea 
                    id="docDescripcion" 
                    placeholder="Descripción del documento"
                    value={nuevoDocumento.descripcion}
                    onChange={(e) => setNuevoDocumento({...nuevoDocumento, descripcion: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="docPublic" 
                    checked={nuevoDocumento.is_public || false}
                    onCheckedChange={(checked) => setNuevoDocumento({...nuevoDocumento, is_public: checked})}
                  />
                  <Label htmlFor="docPublic" className="cursor-pointer">
                    Documento público (visible para clientes)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDocDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={addDocument} 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={!nuevoDocumento.file || !nuevoDocumento.titulo || !nuevoDocumento.tipo_documento}
                >
                  Añadir documento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        {documentos.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-amber-100 rounded-lg bg-gray-50">
            <div className="h-24 w-24 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-amber-400" />
            </div>
            <p className="text-gray-700 font-medium text-lg">Aún no hay documentos</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Las fichas técnicas, manuales o certificados proporcionan información completa sobre el producto
            </p>
            <Button
              className="mt-6 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => setDocDialogOpen(true)}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Añadir primer documento
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Visibilidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((doc, index) => (
                  <TableRow key={doc.id || index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.titulo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-50">
                        {doc.tipo_documento}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={doc.is_public 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                          : "bg-amber-100 text-amber-800 border-amber-200"}
                      >
                        {doc.is_public ? 'Público' : 'Privado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          title="Ver documento"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeDocument(index)}
                          title="Eliminar documento"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}