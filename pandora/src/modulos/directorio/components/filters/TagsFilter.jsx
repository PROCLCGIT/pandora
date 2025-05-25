import React, { useState } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTags } from '../../api/tagService';

const TagsFilter = ({ value = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cargar todas las tags disponibles
  const { data: tagsData, isLoading } = useTags({ page_size: 100 });
  const allTags = tagsData?.results || [];
  
  // Obtener las tags seleccionadas con su información completa
  const selectedTags = allTags.filter(tag => value.includes(tag.id));
  
  const handleToggleTag = (tagId) => {
    if (value.includes(tagId)) {
      onChange(value.filter(id => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };
  
  const handleRemove = (tagId) => {
    onChange(value.filter(id => id !== tagId));
  };
  
  return (
    <div className="flex flex-col space-y-1.5">
      <Label className="text-sm font-medium flex items-center gap-1">
        <TagIcon className="h-3.5 w-3.5" />
        Etiquetas
      </Label>
      
      {/* Tags seleccionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1 text-xs"
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
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleRemove(tag.id)}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 justify-start text-left font-normal"
            disabled={isLoading}
          >
            {selectedTags.length > 0 
              ? `${selectedTags.length} etiqueta${selectedTags.length > 1 ? 's' : ''} seleccionada${selectedTags.length > 1 ? 's' : ''}`
              : "Seleccionar etiquetas"
            }
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
                .filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No se encontraron etiquetas</p>
                ) : (
                  allTags
                    .filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleToggleTag(tag.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors ${
                          value.includes(tag.id) 
                            ? 'bg-gray-100' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color_code }}
                          />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        {value.includes(tag.id) && (
                          <span className="text-xs text-gray-500">✓</span>
                        )}
                      </button>
                    ))
                )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagsFilter;