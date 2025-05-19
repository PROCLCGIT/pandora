// AtributosForm.jsx - Componente para manejar atributos dinámicos usando useFieldArray

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Componente que permite añadir, editar y eliminar múltiples atributos
 * utilizando el hook useFieldArray de React Hook Form
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.form - Instancia del formulario (useForm)
 * @param {string} props.name - Nombre del campo array en el formulario
 * @param {string} props.label - Etiqueta para la sección de atributos
 */
export default function AtributosForm({ form, name, label = "Atributos" }) {
  // Inicializar useFieldArray con el control del formulario y el nombre del campo
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel className="text-base">{label}</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ nombre: "", valor: "" })}
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir atributo
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          No hay atributos definidos. Haz clic en "Añadir atributo" para comenzar.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-2 border p-3 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Campo para el nombre del atributo */}
                <FormField
                  control={form.control}
                  name={`${name}.${index}.nombre`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del atributo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo para el valor del atributo */}
                <FormField
                  control={form.control}
                  name={`${name}.${index}.valor`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Valor</FormLabel>
                      <FormControl>
                        <Input placeholder="Valor del atributo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botón para eliminar este atributo */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                onClick={() => remove(index)}
                title="Eliminar atributo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}