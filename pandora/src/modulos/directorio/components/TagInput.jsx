import React, { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTags, useCreateTag } from '../api/tagService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TagInput = ({ value = [], onChange, placeholder = "Seleccionar etiquetas..." }) => {
  const [open, setOpen] = useState(false);
  const [openNewTag, setOpenNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4F46E5');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Cargar todas las tags disponibles
  const { data: tagsData, isLoading } = useTags({ page_size: 100 });
  const allTags = tagsData?.results || [];

  // Mutation para crear nueva tag
  const createTagMutation = useCreateTag({
    onSuccess: (newTag) => {
      toast({
        title: 'Etiqueta creada',
        description: `La etiqueta "${newTag.name}" ha sido creada correctamente.`,
      });
      // Agregar la nueva tag a las seleccionadas
      onChange([...value, newTag.id]);
      setOpenNewTag(false);
      setNewTagName('');
      setNewTagColor('#4F46E5');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo crear la etiqueta',
        variant: 'destructive',
      });
    },
  });

  // Obtener las tags seleccionadas con su información completa
  const selectedTags = allTags.filter(tag => value.includes(tag.id));

  const handleSelect = (tagId) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
    }
    setOpen(false);
    setSearchTerm('');
  };

  const handleRemove = (tagId) => {
    onChange(value.filter(id => id !== tagId));
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la etiqueta es requerido',
        variant: 'destructive',
      });
      return;
    }

    createTagMutation.mutate({
      name: newTagName.trim(),
      color_code: newTagColor,
    });
  };

  // Colores predefinidos para selección rápida
  const presetColors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
  ];

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <TagIcon className="h-4 w-4" />
        Etiquetas
      </Label>
      
      {/* Tags seleccionadas */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-gray-50">
        {selectedTags.length === 0 ? (
          <span className="text-sm text-gray-500">{placeholder}</span>
        ) : (
          selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
              style={{
                backgroundColor: `${tag.color_code}20`,
                borderColor: tag.color_code,
                color: tag.color_code,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color_code }}
              />
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(tag.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>

      {/* Selector de tags */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
              disabled={isLoading}
            >
              <TagIcon className="h-4 w-4 mr-2" />
              Agregar etiqueta
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-2">
            <div className="space-y-2">
              <Input
                placeholder="Buscar etiqueta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
              <div className="max-h-[200px] overflow-y-auto">
                {allTags
                  .filter(tag => !value.includes(tag.id))
                  .filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No se encontraron etiquetas</p>
                  ) : (
                    allTags
                      .filter(tag => !value.includes(tag.id))
                      .filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleSelect(tag.id)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-left"
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color_code }}
                          />
                          <span className="text-sm">{tag.name}</span>
                        </button>
                      ))
                  )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpenNewTag(true)}
          title="Crear nueva etiqueta"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Dialog para crear nueva tag */}
      <Dialog open={openNewTag} onOpenChange={setOpenNewTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva etiqueta</DialogTitle>
            <DialogDescription>
              Crea una nueva etiqueta con un nombre y color distintivo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Nombre de la etiqueta</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Ej: VIP, Importante, Nuevo..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color de la etiqueta</Label>
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        newTagColor === color ? "border-gray-900 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-20 h-8"
                />
              </div>
            </div>
            
            {/* Vista previa */}
            <div className="space-y-2">
              <Label>Vista previa</Label>
              <div className="p-3 border rounded-md bg-gray-50">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${newTagColor}20`,
                    borderColor: newTagColor,
                    color: newTagColor,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: newTagColor }}
                  />
                  {newTagName || 'Nueva etiqueta'}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenNewTag(false);
                setNewTagName('');
                setNewTagColor('#4F46E5');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || createTagMutation.isPending}
            >
              {createTagMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Creando...
                </>
              ) : (
                'Crear etiqueta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagInput;