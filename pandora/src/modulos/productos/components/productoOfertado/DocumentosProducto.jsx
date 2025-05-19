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
    <Card className="border-0 shadow-sm mb-8 bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
        <CardTitle className="text-lg font-medium text-blue-800">Documentos del Producto</CardTitle>
        <CardDescription className="text-blue-700/70">
          Añade documentos técnicos, manuales u otros archivos relacionados
        </CardDescription>
      </div>
      <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2">
        <div></div>
        <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-4 ml-auto shadow-sm">
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
              <Button type="button" onClick={addDocument} className="bg-blue-600 hover:bg-blue-700 rounded-full">
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-6 pt-2">
        {documentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">Aún no hay documentos para este producto</p>
            <p className="text-sm text-slate-500 mt-1">
              Haz clic en "Añadir Documento" para subir documentos
            </p>
          </div>
        ) : (
          <Table className="border rounded-lg">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc, index) => (
                <TableRow key={doc.id || doc.generatedId || `doc-${index}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2 text-gray-500" />
                      {doc.titulo}
                    </div>
                  </TableCell>
                  <TableCell>{doc.tipo_documento}</TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {doc.is_public ? 'Público' : 'Privado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      onClick={() => removeDocument(index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentosProducto;