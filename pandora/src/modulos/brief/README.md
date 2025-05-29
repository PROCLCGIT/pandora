# 📋 Módulo Brief - Gestión de Requerimientos

## 🎯 **Descripción General**

El módulo **Brief** es una solución completa para la gestión de requerimientos y solicitudes de clientes. Diseñado con las mejores prácticas de UX/UI modernas, ofrece una interfaz intuitiva y profesional para administrar todo el ciclo de vida de los briefs.

## ✨ **Características Principales**

### 🏠 **Dashboard Interactivo**
- Estadísticas en tiempo real con tarjetas animadas
- Vista de tarjetas y lista intercambiables
- Filtros avanzados con múltiples criterios
- Búsqueda instantánea y responsiva

### 📝 **Gestión Completa de Briefs**
- Formularios inteligentes con validación en tiempo real
- Sistema de estados con colores dinámicos
- Prioridades visuales con indicadores
- Integración con otros módulos del sistema

### 🎨 **Diseño Moderno**
- Gradientes y efectos visuales sutiles
- Sistema de colores consistente
- Responsive design para todos los dispositivos
- Animaciones y transiciones suaves

### 🤝 **Colaboración**
- Sistema de comentarios en tiempo real
- Historial completo de cambios
- Asignación de operadores
- Notificaciones y menciones

## 🚀 **Instalación y Configuración**

### **1. Estructura de Archivos**
```
src/modulos/brief/
├── api/
│   └── briefApi.js
├── components/
│   ├── BriefCard.jsx
│   ├── BriefList.jsx
│   ├── BriefForm.jsx
│   ├── BriefFilters.jsx
│   ├── StatsCards.jsx
│   ├── BriefItemsList.jsx
│   ├── BriefHistoryTimeline.jsx
│   └── BriefComments.jsx
├── hooks/
│   └── useBriefs.js
├── pages/
│   ├── BriefDashboard.jsx
│   └── BriefDetailPage.jsx
├── routes/
│   ├── BriefRoutes.jsx
│   └── index.js
├── utils/
│   └── briefColors.js
└── index.js
```

### **2. Dependencias Requeridas**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-router-dom": "^7.5.3",
    "@tanstack/react-query": "^5.74.11",
    "react-hook-form": "^7.56.1",
    "axios": "^1.9.0",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.503.0"
  }
}
```

### **3. Configuración en el Backend**
```bash
# Migrar las tablas del módulo Brief
cd backend/
python manage.py makemigrations brief
python manage.py migrate brief

# Crear grupos de permisos
python manage.py shell
>>> from django.contrib.auth.models import Group
>>> brief_operators, created = Group.objects.get_or_create(name='brief_operators')
```

## 🎨 **Sistema de Colores**

### **Prioridades**
```javascript
const PRIORITY_COLORS = {
  baja: '#10B981',      // Verde esmeralda
  media: '#F59E0B',     // Ámbar
  alta: '#EF4444',      // Rojo
  urgente: '#8B5CF6',   // Púrpura
  critica: '#DC2626'    // Rojo oscuro + animación
};
```

### **Estados**
```javascript
const STATUS_COLORS = {
  draft: '#6B7280',       // Gris
  pending: '#F59E0B',     // Amarillo
  approved: '#10B981',    // Verde
  processing: '#3B82F6',  // Azul
  completed: '#059669',   // Verde oscuro
  cancelled: '#DC2626'    // Rojo
};
```

## 🔌 **API Endpoints**

### **Endpoints Principales**
```javascript
// Listar briefs con filtros
GET /api/brief/api/v1/briefs/
  ?page=1&page_size=10&search=term&priority=alta&estado=pending

// Crear nuevo brief
POST /api/brief/api/v1/briefs/
{
  "client": 1,
  "title": "Equipos médicos para urgencias",
  "origin": "telefono",
  "description": "Cliente requiere equipos...",
  "priority": "alta",
  "items": [...]
}

// Obtener brief específico
GET /api/brief/api/v1/briefs/{id}/

// Estadísticas del dashboard
GET /api/brief/api/v1/briefs/dashboard_stats/

// Duplicar brief
POST /api/brief/api/v1/briefs/{id}/duplicate/

// Cambiar estado
POST /api/brief/api/v1/briefs/{id}/change_status/
{
  "status": "approved",
  "reason": "Revisado y aprobado"
}
```

## 🎯 **Uso de Componentes**

### **1. Dashboard Principal**
```jsx
import { BriefDashboard } from '@/modulos/brief';

function App() {
  return <BriefDashboard />;
}
```

### **2. Tarjeta de Brief**
```jsx
import { BriefCard } from '@/modulos/brief';

function MyComponent() {
  const handleBriefClick = (brief) => {
    console.log('Brief seleccionado:', brief);
  };

  return (
    <BriefCard
      brief={briefData}
      onClick={handleBriefClick}
      onEdit={handleEdit}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
    />
  );
}
```

### **3. Formulario de Brief**
```jsx
import { BriefForm } from '@/modulos/brief';

function CreateBrief() {
  const handleSubmit = (briefData) => {
    console.log('Datos del brief:', briefData);
  };

  return (
    <BriefForm
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
```

### **4. Hook personalizado**
```jsx
import { useBriefs } from '@/modulos/brief';

function MyComponent() {
  const {
    briefs,
    isLoading,
    filters,
    updateFilters,
    createBrief,
    pagination
  } = useBriefs({
    priority: 'alta',
    estado: 'pending'
  });

  return (
    <div>
      {briefs.map(brief => (
        <div key={brief.id}>{brief.title}</div>
      ))}
    </div>
  );
}
```

## 🔧 **Configuración Avanzada**

### **Personalizar Colores**
```javascript
// utils/briefColors.js
export const PRIORITY_COLORS = {
  // Personaliza los colores según tu marca
  baja: {
    bg: 'bg-custom-green-50',
    badge: 'bg-custom-green-100 text-custom-green-800',
    // ...
  }
};
```

### **Configurar Filtros Predefinidos**
```javascript
// routes/index.js
export const briefPresetFilters = [
  {
    name: 'Mis Briefs Urgentes',
    key: 'my_urgent',
    filters: { 
      my_briefs: true, 
      priority: ['urgente', 'critica'] 
    },
    icon: 'AlertTriangle',
    color: 'red'
  }
];
```

### **Personalizar Formulario**
```jsx
// Agregar campos personalizados al formulario
const customFields = [
  {
    name: 'proyecto',
    label: 'Proyecto Asociado',
    type: 'select',
    options: proyectos
  }
];
```

## 📊 **Métricas y Monitoreo**

### **Estadísticas Disponibles**
- Total de briefs activos
- Tasa de completado
- Briefs vencidos
- Presupuesto total
- Tiempo promedio de procesamiento
- Distribución por prioridad y estado

### **Filtros Avanzados**
- Por fecha (emisión, límite)
- Por estado y prioridad
- Por cliente y operador
- Por origen del pedido
- Por rangos de presupuesto
- Filtros rápidos predefinidos

## 🔐 **Permisos y Seguridad**

### **Permisos Disponibles**
```python
# Django Permissions
brief.view_brief      # Ver briefs
brief.add_brief       # Crear briefs
brief.change_brief    # Modificar briefs
brief.delete_brief    # Eliminar briefs
brief.export_brief    # Exportar briefs
```

### **Grupos de Usuario**
- **brief_operators**: Operadores que pueden crear/modificar briefs
- **brief_managers**: Gestores con acceso completo
- **brief_viewers**: Solo lectura

## 🎨 **Personalización de UI**

### **Temas y Variables CSS**
```css
:root {
  --brief-primary-color: #3B82F6;
  --brief-success-color: #10B981;
  --brief-warning-color: #F59E0B;
  --brief-danger-color: #EF4444;
  --brief-border-radius: 0.75rem;
  --brief-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### **Componentes Personalizados**
```jsx
// Crear variantes de componentes existentes
const CustomBriefCard = styled(BriefCard)`
  /* Tus estilos personalizados */
`;
```

## 🚀 **Performance y Optimización**

### **Características de Performance**
- Lazy loading de componentes
- React Query para cache inteligente
- Paginación eficiente
- Búsqueda debounced
- Optimistic updates
- Prefetch de datos relacionados

### **Configuración de Cache**
```javascript
// hooks/useBriefs.js
const queryOptions = {
  staleTime: 30000,        // 30 segundos
  cacheTime: 300000,       // 5 minutos
  refetchOnWindowFocus: false,
  keepPreviousData: true
};
```

## 🧪 **Testing**

### **Estructura de Tests**
```javascript
// __tests__/BriefCard.test.jsx
import { render, screen } from '@testing-library/react';
import { BriefCard } from '../components/BriefCard';

test('renders brief card with correct data', () => {
  const mockBrief = {
    id: 1,
    title: 'Test Brief',
    priority: 'alta'
  };
  
  render(<BriefCard brief={mockBrief} />);
  expect(screen.getByText('Test Brief')).toBeInTheDocument();
});
```

## 📱 **Responsive Design**

### **Breakpoints**
```css
/* Mobile First Approach */
.brief-card {
  /* Base: Mobile */
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  /* Tablet */
  .brief-card {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .brief-card {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🔄 **Integración con Otros Módulos**

### **Exportar a Proformas**
```javascript
const exportToProforma = async (briefId) => {
  const response = await briefApiService.exportBrief(briefId, 'proforma');
  // Redirigir al módulo de proformas
  navigate(`/proformas/create?from_brief=${briefId}`);
};
```

### **Importar desde Directorio**
```javascript
// Obtener clientes del módulo directorio
const { data: clientes } = useQuery('clientes', () => 
  directorioApi.getClients()
);
```

## 🐛 **Troubleshooting**

### **Problemas Comunes**

1. **Error: "Brief not found"**
   - Verificar permisos de usuario
   - Comprobar ID del brief en la URL

2. **Formulario no valida**
   - Revisar campos requeridos
   - Verificar conexión con el backend

3. **Colores no se muestran**
   - Verificar importación de utilidades
   - Comprobar clases de Tailwind CSS

### **Debug Mode**
```javascript
// Habilitar logs detallados
localStorage.setItem('DEBUG_BRIEF_MODULE', 'true');
```

## 📈 **Roadmap y Futuras Mejoras**

### **Próximas Características**
- [ ] Notificaciones push en tiempo real
- [ ] Integración con calendario
- [ ] Templates de brief predefinidos
- [ ] Análisis predictivo de tiempos
- [ ] API webhooks para integraciones
- [ ] Modo offline con sincronización
- [ ] Exportación avanzada (Excel, PDF)
- [ ] Dashboard ejecutivo con KPIs

### **Mejoras de UX**
- [ ] Tour interactivo para nuevos usuarios
- [ ] Atajos de teclado
- [ ] Arrastrar y soltar para organizar
- [ ] Vista kanban por estados
- [ ] Filtros con autocompletado inteligente

## 🤝 **Contribución**

### **Guía para Desarrolladores**
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### **Estándares de Código**
- Usar ESLint y Prettier
- Seguir convenciones de naming
- Agregar tests para nuevas funcionalidades
- Documentar componentes con JSDoc

## 📞 **Soporte**

- **Documentación**: `/docs/brief-module`
- **Issues**: Crear issue en el repositorio
- **Slack**: Canal #brief-module
- **Email**: soporte@empresa.com

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Mantainer**: Equipo de Desarrollo Frontend
