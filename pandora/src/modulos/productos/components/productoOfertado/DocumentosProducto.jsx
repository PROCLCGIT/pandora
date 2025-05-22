// DocumentosProducto.jsx
import { FilePlus, FileText, File, Trash } from 'lucide-react';
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

/**
 * Componente para gestionar documentos del producto
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.documentos - Array de documentos
 * @param {Function} props.removeDocument - Función para eliminar documento
 * @param {Object} props.nuevoDocumento - Estado del nuevo documento
 * @param {Function} props.setNuevoDocumento - Función para actualizar estado del nuevo documento
 * @param {boolean} props.docDialogOpen - Estado del diálogo de documentos
 * @param {Function} props.setDocDialogOpen - Función para actualizar estado del diálogo
 * @param {Function} props.handleDocUpload - Función para manejar la subida de documentos
 * @param {Function} props.addDocument - Función para añadir documento
 * @param {Function} props.cancelDocDialog - Función para cancelar diálogo
 * @param {Object} props.docInputRef - Referencia para el input de documentos
 * @returns {JSX.Element} Componente de documentos
 */
const DocumentosProducto = ({ 
  documentos, 
  removeDocument, 
  nuevoDocumento, 
  setNuevoDocumento, 
  docDialogOpen, 
  setDocDialogOpen, 
  handleDocUpload, 
  addDocument, 
  cancelDocDialog, 
  docInputRef 
}) => {
  return (
    <Card className="border border-gray-200 shadow-md rounded-xl h-full mb-8 bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-amber-500 p-2 rounded-lg mr-3 shadow-sm">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-gray-800">Documentos del Producto</CardTitle>
            <CardDescription className="text-gray-500">
              Añade documentos técnicos, manuales u otros archivos relacionados
            </CardDescription>
          </div>
        </div>
      </div>
      <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2">
        <div></div>
        <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 rounded-full px-4 ml-auto shadow-sm">
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
                <Label htmlFor="doc-file" className="text-gray-700 font-medium">Documento <span className="text-red-500">*</span></Label>
                <Input
                  id="doc-file"
                  type="file"
                  ref={docInputRef}
                  onChange={handleDocUpload}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-tipo" className="text-gray-700 font-medium">Tipo de Documento <span className="text-red-500">*</span></Label>
                <Select
                  onValueChange={(value) => setNuevoDocumento({...nuevoDocumento, tipo_documento: value})}
                  value={nuevoDocumento.tipo_documento}
                >
                  <SelectTrigger id="doc-tipo">
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
                <Label htmlFor="doc-titulo" className="text-gray-700 font-medium">Título <span className="text-red-500">*</span></Label>
                <Input
                  id="doc-titulo"
                  placeholder="Título del documento"
                  value={nuevoDocumento.titulo}
                  onChange={(e) => setNuevoDocumento({...nuevoDocumento, titulo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-descripcion" className="text-gray-700 font-medium">Descripción</Label>
                <Textarea
                  id="doc-descripcion"
                  placeholder="Descripción del documento"
                  value={nuevoDocumento.descripcion}
                  onChange={(e) => setNuevoDocumento({...nuevoDocumento, descripcion: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="doc-public"
                  checked={nuevoDocumento.isPublic}
                  onCheckedChange={(checked) => setNuevoDocumento({...nuevoDocumento, isPublic: checked === true})}
                />
                <Label htmlFor="doc-public" className="cursor-pointer text-gray-700 font-medium">
                  Documento público (visible para clientes)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={cancelDocDialog}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={addDocument} className="bg-amber-600 hover:bg-amber-700 rounded-full">
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-6 pt-2">
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
                  <TableRow key={doc.id || doc.generatedId || `doc-${index}`} className="hover:bg-gray-50">
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
};

export default DocumentosProducto;