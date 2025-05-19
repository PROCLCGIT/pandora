import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createEmpresa } from "@/services/empresaService";
import { PlusCircle, FileText } from "lucide-react";

const EmpresaForm = ({ onEmpresaAdded, initialEntityType }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipoEntidad, setTipoEntidad] = useState(initialEntityType || "sri");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    empresa: "",
    ruc: "",
    usuario: "",
    contrasena: "",
    correo: "",
    telefono: "",
    representante: "",
    // Campos adicionales para OtrasInstituciones
    institucion: "",
    url: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      empresa: "",
      ruc: "",
      usuario: "",
      contrasena: "",
      correo: "",
      telefono: "",
      representante: "",
      institucion: "",
      url: ""
    });
    setTipoEntidad("sri");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar campos requeridos
      const requiredFields = ['empresa', 'ruc', 'usuario', 'contrasena', 'correo', 'telefono', 'representante'];
      
      // Para OtrasInstituciones, añadir campos adicionales a la validación
      if (tipoEntidad === "otrasinstituciones") {
        requiredFields.push('institucion', 'url');
      }
      
      // Verificar si hay algún campo requerido vacío
      const emptyFields = requiredFields.filter(field => !formData[field]);
      
      if (emptyFields.length > 0) {
        toast({
          title: "Campos requeridos",
          description: `Por favor complete los siguientes campos: ${emptyFields.join(', ')}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Preparar datos según el tipo de entidad
      const dataToSubmit = { 
        ...formData,
        // Agregar campos que podrían necesitarse
        id: Date.now(), // Generar un ID temporal para modo de depuración
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      
      // Si no es OtrasInstituciones, eliminamos los campos adicionales
      if (tipoEntidad !== "otrasinstituciones") {
        delete dataToSubmit.institucion;
        delete dataToSubmit.url;
      }

      console.log(`Enviando datos a ${tipoEntidad}:`, dataToSubmit);
      
      // Usar la API real, no simulación
      const usarSimulacion = false;
      let created;
      
      if (usarSimulacion) {
        // Simular una pequeña pausa
        await new Promise(resolve => setTimeout(resolve, 500));
        created = { ...dataToSubmit, id: Date.now() };
        console.log("DEPURACIÓN: Simulación de datos guardados exitosamente:", created);
      } else {
        console.log("Enviando datos reales a la API...");
        created = await createEmpresa(dataToSubmit, tipoEntidad);
        console.log("Datos guardados exitosamente en la base de datos:", created);
      }
      
      toast({
        title: "Éxito",
        description: `Datos de ${tipoEntidad} guardados correctamente`,
        variant: "success"
      });
      
      // Notificar al componente padre pasando el tipo de entidad y los datos creados
      if (onEmpresaAdded) {
        onEmpresaAdded(tipoEntidad, created);
      }
      
      // Cerrar el diálogo y limpiar el formulario
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error al guardar datos:", error);
      
      // Mensajes de error más descriptivos
      let errorMessage = "No se pudieron guardar los datos. Intente nuevamente.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Error en los datos enviados. Verifique los campos.";
          if (error.response.data) {
            // Si hay detalles de errores de validación
            const validationErrors = Object.entries(error.response.data)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('; ');
            
            if (validationErrors) {
              errorMessage += ` Detalles: ${validationErrors}`;
            }
          }
        } else if (error.response.status === 401) {
          errorMessage = "No está autorizado para realizar esta acción.";
        } else if (error.response.status === 500) {
          errorMessage = "Error en el servidor. Contacte al administrador.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <FileText className="mr-2 h-4 w-4" />
          Nuevo Registro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ingresar Nuevos Datos</DialogTitle>
          <DialogDescription>
            Complete el formulario para agregar un nuevo registro.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="mb-4">
            <Label htmlFor="tipoEntidad">Tipo de Entidad</Label>
            <Select 
              value={tipoEntidad} 
              onValueChange={setTipoEntidad}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sri">SRI</SelectItem>
                <SelectItem value="sercop">SERCOP</SelectItem>
                <SelectItem value="supercom">SUPERCOM</SelectItem>
                <SelectItem value="otrasinstituciones">Otras Instituciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Nombre de Empresa</Label>
              <Input
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                name="contrasena"
                type="password"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="representante">Representante</Label>
              <Input
                id="representante"
                name="representante"
                value={formData.representante}
                onChange={handleChange}
                required
              />
            </div>
            
            {tipoEntidad === "otrasinstituciones" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="institucion">Institución</Label>
                  <Input
                    id="institucion"
                    name="institucion"
                    value={formData.institucion}
                    onChange={handleChange}
                    required={tipoEntidad === "otrasinstituciones"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    value={formData.url}
                    onChange={handleChange}
                    required={tipoEntidad === "otrasinstituciones"}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="ml-2"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmpresaForm;