// InformacionProducto.jsx
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Package, CheckCircle } from 'lucide-react'

// Importaciones de componentes UI
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Mutations para crear categorías y especialidades
import { useCreateCategoria } from '@/modulos/basic/api/categoriaService'
import { useCreateEspecialidad } from '@/modulos/basic/api/especialidadService'
import { useToast } from '@/hooks/use-toast'

/**
 * Componente de formulario para la información básica del producto
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.control - Control de React Hook Form
 * @param {Object} props.errors - Errores de validación del formulario
 * @param {Array} props.categoriasData - Datos de categorías
 * @param {Array} props.especialidadesData - Datos de especialidades
 * @returns {JSX.Element} Componente de formulario
 */
function InformacionProducto ({
  control,
  errors,
  categoriasData,
  especialidadesData,
  formValues, // Valores del formulario en tiempo real
}) {
  const { toast } = useToast()

  // Estados para diálogos
  const [openCatDialog, setOpenCatDialog] = useState(false)
  const [openEspDialog, setOpenEspDialog] = useState(false)

  const [catName, setCatName] = useState('')
  const [catCode, setCatCode] = useState('')
  const [espName, setEspName] = useState('')
  const [espCode, setEspCode] = useState('')

  // Mutaciones
  const createCategoriaMutation = useCreateCategoria({
    onSuccess: data => {
      toast({
        title: 'Categoría creada',
        description: `Se creó "${data.nombre}" correctamente`,
      })
      setOpenCatDialog(false)
      setCatName('')
      setCatCode('')
    },
    onError: error => {
      toast({
        title: 'Error al crear categoría',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const createEspecialidadMutation = useCreateEspecialidad({
    onSuccess: data => {
      toast({
        title: 'Especialidad creada',
        description: `Se creó "${data.nombre}" correctamente`,
      })
      setOpenEspDialog(false)
      setEspName('')
      setEspCode('')
    },
    onError: error => {
      toast({
        title: 'Error al crear especialidad',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleCreateCategoria = e => {
    e.preventDefault()
    if (!catName.trim()) return
    createCategoriaMutation.mutate({ nombre: catName.trim(), code: catCode.trim() || undefined })
  }

  const handleCreateEspecialidad = e => {
    e.preventDefault()
    if (!espName.trim()) return
    createEspecialidadMutation.mutate({ nombre: espName.trim(), code: espCode.trim() || undefined })
  }

  return (
    <Card className="border border-gray-200 shadow-md rounded-xl mb-8 bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-800">Información del Producto</CardTitle>
              <CardDescription className="text-gray-500">
                Ingresa los datos básicos del producto que se ofrecerá en el catálogo
              </CardDescription>
            </div>
          </div>
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <span className="text-red-500 mr-1">*</span> Campos obligatorios
          </div>
        </div>
      </div>
      <CardHeader className="pt-6 pb-2">
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-gray-700 font-medium flex items-center justify-between">
              <span>Código <span className="text-red-500">*</span></span>
              {formValues?.code && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  id="code"
                  placeholder="Código del producto"
                  {...field}
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? "code-error" : undefined}
                  className={errors.code ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
              )}
            />
            {errors.code && (
              <p id="code-error" className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          {/* CUDIM */}
          <div className="space-y-2">
            <Label htmlFor="cudim" className="text-gray-700 font-medium flex items-center justify-between">
              <span>CUDIM <span className="text-red-500">*</span></span>
              {formValues?.cudim && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Controller
              name="cudim"
              control={control}
              render={({ field }) => (
                <Input
                  id="cudim"
                  placeholder="Código CUDIM del producto"
                  {...field}
                  aria-invalid={!!errors.cudim}
                  aria-describedby={errors.cudim ? "cudim-error" : undefined}
                  className={errors.cudim ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
              )}
            />
            {errors.cudim && (
              <p id="cudim-error" className="text-sm text-red-500">{errors.cudim.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-gray-700 font-medium flex items-center justify-between">
              <span>Nombre <span className="text-red-500">*</span></span>
              {formValues?.nombre && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <Input
                  id="nombre"
                  placeholder="Nombre del producto"
                  {...field}
                  aria-invalid={!!errors.nombre}
                  aria-describedby={errors.nombre ? "nombre-error" : undefined}
                  className={errors.nombre ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
              )}
            />
            {errors.nombre && (
              <p id="nombre-error" className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="id_categoria" className="text-gray-700 font-medium flex items-center justify-between">
              <span>Categoría <span className="text-red-500">*</span></span>
              {formValues?.id_categoria && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Controller
              name="id_categoria"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={value => {
                    if (value === '__add_new_cat__') {
                      setOpenCatDialog(true)
                      return
                    }
                    field.onChange(value === 'none' ? undefined : value)
                  }}
                  value={field.value}
                  aria-invalid={!!errors.id_categoria}
                  aria-describedby={errors.id_categoria ? "categoria-error" : undefined}
                >
                  <SelectTrigger id="id_categoria" className={errors.id_categoria ? "border-red-300 ring-red-500" : ""}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasData?.results?.map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new_cat__" className="text-indigo-600 font-medium">
                      + Agregar nueva categoría
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.id_categoria && (
              <p id="categoria-error" className="text-sm text-red-500">{errors.id_categoria.message}</p>
            )}
          </div>

          {/* Especialidad */}
          <div className="space-y-2">
            <Label htmlFor="especialidad" className="text-gray-700 font-medium">Especialidad</Label>
            <Controller
              name="especialidad"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={value => {
                    if (value === '__add_new_esp__') {
                      setOpenEspDialog(true)
                      return
                    }
                    if (value === 'none' || !value) {
                      field.onChange(undefined)
                    } else {
                      field.onChange(value)
                    }
                  }}
                  value={field.value?.toString() || "none"}
                  aria-invalid={!!errors.especialidad}
                  aria-describedby={errors.especialidad ? "especialidad-error" : undefined}
                >
                  <SelectTrigger id="especialidad" className={errors.especialidad ? "border-red-300 ring-red-500" : ""}>
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Opción para vacío/sin especialidad */}
                    <SelectItem key="empty" value="none">
                      -- Sin especialidad --
                    </SelectItem>
                    {especialidadesData?.results?.map(especialidad => (
                      <SelectItem
                        key={especialidad.id}
                        value={especialidad.id.toString()}
                      >
                        {especialidad.nombre}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new_esp__" className="text-indigo-600 font-medium">
                      + Agregar nueva especialidad
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.especialidad ? (
              <p id="especialidad-error" className="text-sm text-red-500">{errors.especialidad.message}</p>
            ) : null}
            <p className="text-xs text-gray-500 mt-1">
              Si no requiere una especialidad específica, seleccione "Sin especialidad" de la lista.
            </p>
          </div>

          {/* Activo */}
          <div className="space-y-2 flex items-center">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="is_active" 
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    className="text-indigo-600"
                  />
                )}
              />
              <Label htmlFor="is_active" className="cursor-pointer text-gray-700 font-medium">Activo</Label>
            </div>
          </div>

          {/* Descripción - Span de 2 columnas */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="descripcion" className="text-gray-700 font-medium">Descripción</Label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <Textarea 
                  id="descripcion" 
                  placeholder="Describe el producto ofertado" 
                  rows={4}
                  {...field} 
                />
              )}
            />
          </div>

          {/* Referencias - Span de 2 columnas */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="referencias" className="text-gray-700 font-medium">Referencias</Label>
            <Controller
              name="referencias"
              control={control}
              render={({ field }) => (
                <Textarea 
                  id="referencias" 
                  placeholder="Referencias adicionales del producto" 
                  rows={4}
                  {...field} 
                />
              )}
            />
          </div>
        </div>

        {/* Dialog para nueva categoría */}
        <Dialog open={openCatDialog} onOpenChange={setOpenCatDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva categoría</DialogTitle>
              <DialogDescription>
                Ingresa la información para crear una nueva categoría
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCategoria} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Nombre</Label>
                <Input id="catName" value={catName} onChange={e => setCatName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catCode">Código (opcional)</Label>
                <Input id="catCode" value={catCode} onChange={e => setCatCode(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCatDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCategoriaMutation.isPending}>
                  {createCategoriaMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para nueva especialidad */}
        <Dialog open={openEspDialog} onOpenChange={setOpenEspDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva especialidad</DialogTitle>
              <DialogDescription>
                Ingresa la información para crear una nueva especialidad
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEspecialidad} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="espName">Nombre</Label>
                <Input id="espName" value={espName} onChange={e => setEspName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="espCode">Código (opcional)</Label>
                <Input id="espCode" value={espCode} onChange={e => setEspCode(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEspDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEspecialidadMutation.isPending}>
                  {createEspecialidadMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default InformacionProducto;