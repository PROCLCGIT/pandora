// CamposDinamicosPage.jsx - Página de ejemplo para campos dinámicos

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Importar nuestros componentes para campos dinámicos
import AtributosForm from "../../components/categorias/AtributosForm";
import TagsInput from "../../components/common/TagsInput";

// Esquema de validación para el formulario
const formSchema = yup.object({
  nombre: yup
    .string()
    .required("El nombre es obligatorio")
    .max(255, "El nombre no debe exceder los 255 caracteres"),
  descripcion: yup
    .string()
    .max(500, "La descripción no debe exceder los 500 caracteres"),
  // Validación para el array de atributos
  atributos: yup.array().of(
    yup.object({
      nombre: yup
        .string()
        .required("El nombre del atributo es obligatorio")
        .max(100, "El nombre no debe exceder los 100 caracteres"),
      valor: yup
        .string()
        .required("El valor del atributo es obligatorio")
        .max(255, "El valor no debe exceder los 255 caracteres"),
    })
  ),
  // También podemos añadir otro tipo de campo dinámico como etiquetas
  etiquetas: yup.array().of(
    yup.object({
      nombre: yup
        .string()
        .required("El nombre de la etiqueta es obligatorio")
        .max(50, "La etiqueta no debe exceder los 50 caracteres"),
    })
  ),
});

export default function CamposDinamicosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Inicializar React Hook Form con el esquema de validación
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      atributos: [], // Array vacío para los atributos
      etiquetas: [], // Array vacío para las etiquetas
    },
  });

  // Función para manejar el envío del formulario
  const onSubmit = (data) => {
    // Simular envío a la API
    console.log("Datos enviados:", data);
    
    // Mostrar toast de éxito
    toast({
      title: "Formulario enviado",
      description: "Los datos se han enviado correctamente.",
    });
    
    // En un caso real, aquí llamaríamos a una mutación de React Query
  };

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Ejemplo de Campos Dinámicos</CardTitle>
          <CardDescription>
            Demuestra cómo trabajar con arrays de campos usando React Hook Form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campos básicos */}
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del elemento" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre descriptivo para el elemento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción del elemento" {...field} />
                      </FormControl>
                      <FormDescription>
                        Descripción detallada (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sección de atributos dinámicos */}
              <div className="border p-4 rounded-md">
                <AtributosForm 
                  form={form}
                  name="atributos" 
                  label="Atributos del Elemento" 
                />
              </div>

              {/* Sección de etiquetas dinámicas usando el componente especializado */}
              <div className="border p-4 rounded-md">
                <TagsInput 
                  form={form}
                  name="etiquetas" 
                  label="Etiquetas" 
                  description="Escribe una etiqueta y presiona Enter o el botón + para añadirla"
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </CardFooter>
      </Card>

      {/* Sección para previsualizar los datos del formulario (útil durante desarrollo) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Vista previa de datos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}