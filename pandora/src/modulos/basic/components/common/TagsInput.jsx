// TagsInput.jsx - Componente especializado para entrada de etiquetas (tags)

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Componente para manejar entrada de etiquetas (tags)
 * Proporciona una interfaz más amigable para agregar múltiples etiquetas cortas
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.form - Instancia del formulario (useForm)
 * @param {string} props.name - Nombre del campo array en el formulario
 * @param {string} props.label - Etiqueta para el campo
 * @param {string} props.description - Descripción opcional del campo
 */
export default function TagsInput({ 
  form, 
  name, 
  label = "Etiquetas", 
  description = "Presiona Enter o haz clic en + para añadir una etiqueta" 
}) {
  const [inputValue, setInputValue] = useState("");
  
  // Inicializar useFieldArray
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  // Manejar la adición de una nueva etiqueta
  const handleAddTag = () => {
    // Verificar que la etiqueta no esté vacía
    if (inputValue.trim() === "") return;
    
    // Añadir la etiqueta al array
    append({ nombre: inputValue.trim() });
    
    // Limpiar el input
    setInputValue("");
  };

  // Manejar eventos de teclado (Enter para añadir)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevenir envío del formulario
      handleAddTag();
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-4">
        {/* Input para añadir nueva etiqueta */}
        <div className="flex space-x-2">
          <FormControl>
            <Input
              placeholder="Nueva etiqueta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </FormControl>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddTag}
            title="Añadir etiqueta"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de etiquetas */}
        <div className="flex flex-wrap gap-2">
          {fields.length === 0 ? (
            <div className="text-sm text-muted-foreground w-full">
              No hay etiquetas añadidas
            </div>
          ) : (
            fields.map((field, index) => (
              <Badge
                key={field.id}
                className="px-3 py-2 flex items-center space-x-1 hover:bg-primary/90"
              >
                <span>{field.nombre}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => remove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          )}
        </div>
      </div>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}