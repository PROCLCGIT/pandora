# 🚀 Migration Checklist - Performance Optimizations

## 📋 Quick Actions for Immediate Impact

### ⚡ High Priority (Fix Today)

- [ ] **Replace `watch()` without destructuring**
  ```diff
  - const formValues = watch();
  - const categoria = formValues.id_categoria;
  + const categoria = useCategoryWatch(control);
  ```

- [ ] **Wrap expensive calculations in useMemo**
  ```diff
  - const formProgress = Math.round((completedFields / totalFields) * 100);
  + const formProgress = useFormProgress(control, requiredFields, getValues);
  ```

- [ ] **Add URL cleanup for file uploads**
  ```diff
  - const imageURL = URL.createObjectURL(file);
  + const { url, urlId } = createManagedURL(file);
  + // Auto-cleanup on component unmount
  ```

- [ ] **Replace direct icon imports with dynamic loading**
  ```diff
  - import { Save, Edit, Delete } from 'lucide-react';
  + import { ProductosIcons } from '../components/icons/OptimizedIcons';
  ```

### 🔧 Implementation Steps

#### Step 1: Import Optimized Hooks
```javascript
// Add to component imports
import { 
  useFormProgress, 
  useCategoryWatch,
  useProductFormWatch
} from '../../hooks/useOptimizedFormWatch.js';

import { 
  useOptimizedImageManager, 
  useOptimizedDocumentManager 
} from '../../hooks/useImageMemoryManagement.js';
```

#### Step 2: Replace watch() Usage
```javascript
// ❌ Before
const formValues = watch();
const categoria = formValues.id_categoria;
const nombre = formValues.nombre;

// ✅ After
const categoria = useCategoryWatch(control);
const { categoria: categoriaValue, nombre, code } = useProductFormWatch(control);
```

#### Step 3: Optimize Form Progress
```javascript
// ❌ Before
const completedRequiredFields = requiredFields.filter(field => 
  formValues[field] && formValues[field].toString().trim() !== ''
).length;
const formProgress = Math.round((completedRequiredFields / requiredFields.length) * 100);

// ✅ After
const requiredFields = useMemo(() => [
  'code', 'nombre', 'id_categoria', 'id_producto_ofertado', 
  'id_marca', 'unidad_presentacion', 'procedencia'
], []);

const formProgress = useFormProgress(control, requiredFields, getValues);
```

#### Step 4: Fix Memory Leaks
```javascript
// ❌ Before
const addImage = () => {
  const imageURL = URL.createObjectURL(nuevaImagen.file);
  setImagenes([...imagenes, { imagen: imageURL, file }]);
};

// ✅ After
const imageManager = useOptimizedImageManager(toast);

const addImage = useCallback(() => {
  const success = imageManager.addImage(nuevaImagen);
  if (success) {
    setNuevaImagen({ file: null, descripcion: '', isPrimary: false });
    setImageDialogOpen(false);
  }
}, [imageManager, nuevaImagen]);
```

#### Step 5: Optimize Icons
```javascript
// ❌ Before
import { Save, ArrowLeft, Upload, Trash } from 'lucide-react';

// ✅ After
import { ProductosIcons, IconPreloader } from '../../components/icons/OptimizedIcons.jsx';

// Wrap component with preloader
<IconPreloader iconNames={['Save', 'ArrowLeft', 'Upload']}>
  <YourComponent />
</IconPreloader>

// Use optimized icons
<ProductosIcons.save className="h-4 w-4" />
<ProductosIcons.back className="h-4 w-4" />
```

## 🧪 Testing Checklist

### ✅ Performance Tests
- [ ] **React DevTools Profiler**: Record 30 seconds of form interaction
  - Before: >100 re-renders
  - After: <10 re-renders
  
- [ ] **Memory Usage**: Open DevTools Memory tab
  - Before: Growing memory usage
  - After: Stable memory usage
  
- [ ] **Bundle Size**: Run `npm run build && npm run analyze`
  - Before: 2.1MB initial bundle
  - After: <2.0MB initial bundle

- [ ] **Network Tab**: Check icon loading
  - Before: All icons loaded upfront
  - After: Icons loaded on demand

### ✅ Functional Tests
- [ ] Form validation still works
- [ ] Image upload/preview functions correctly
- [ ] Document upload works
- [ ] Form progress updates correctly
- [ ] Category-based code generation works
- [ ] Manual/auto code toggle functions

### ✅ Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 📊 Performance Metrics to Track

### Before Optimization
```bash
# Run these commands to get baseline
npm run dev
# Open Chrome DevTools
# Go to Lighthouse tab
# Run Performance audit
# Record scores:
```

- **Performance Score**: ___/100
- **Memory Usage After 5min**: ___MB
- **Re-renders per minute**: ___
- **Bundle Size**: ___MB

### After Optimization
- **Performance Score**: ___/100 (Target: >90)
- **Memory Usage After 5min**: ___MB (Target: <+5MB)
- **Re-renders per minute**: ___ (Target: <10)
- **Bundle Size**: ___MB (Target: <2.0MB)

## 🚨 Common Pitfalls

### ❌ Don't Do This
```javascript
// Don't destructure watch() without field names
const { categoria, nombre } = watch(); // Still causes global re-renders

// Don't forget cleanup in useEffect
useEffect(() => {
  const url = URL.createObjectURL(file);
  // Missing cleanup!
}, [file]);

// Don't import all icons at once
import * as Icons from 'lucide-react'; // Huge bundle impact
```

### ✅ Do This Instead
```javascript
// Use specific field watching
const categoria = useWatch({ control, name: 'id_categoria' });

// Always cleanup URLs
useEffect(() => {
  const url = URL.createObjectURL(file);
  return () => URL.revokeObjectURL(url);
}, [file]);

// Use optimized icon system
import { OptimizedIcon } from '../components/icons/OptimizedIcons';
```

## 🔄 Rollback Plan

If performance optimizations cause issues:

### Quick Rollback
1. **Comment out optimized imports**
   ```javascript
   // import { useFormProgress } from '../../hooks/useOptimizedFormWatch.js';
   ```

2. **Restore original watch() usage**
   ```javascript
   const formValues = watch();
   const categoria = formValues.id_categoria;
   ```

3. **Restore direct icon imports**
   ```javascript
   import { Save, ArrowLeft } from 'lucide-react';
   ```

### Gradual Rollback
- Disable one optimization at a time
- Test after each rollback
- Identify the problematic optimization
- Fix and re-deploy

## 📈 Success Metrics

### Week 1 Targets
- [ ] Performance score improvement: +10 points
- [ ] Memory leak fixes: 100% (0 leaks)
- [ ] Re-render reduction: 50%
- [ ] Bundle size reduction: 5%

### Month 1 Targets
- [ ] Performance score: >90
- [ ] Memory usage stable: <+5MB growth
- [ ] Re-renders: <10/minute during editing
- [ ] Bundle size: <2.0MB

### Quarter Targets
- [ ] Performance score: >95
- [ ] All forms optimized
- [ ] Automated performance tests
- [ ] Performance budget in CI/CD

## 🛠️ Tools & Commands

### Development
```bash
# Start with performance monitoring
npm run dev -- --analyze

# Build and analyze bundle
npm run build
npm run analyze

# Run performance tests
npm run test:performance
```

### Debugging
```javascript
// Add to component for debugging
const usePerformanceDebug = (componentName) => {
  useEffect(() => {
    console.log(`${componentName} rendered at ${Date.now()}`);
  });
};
```

### Monitoring
```javascript
// Add to main app for production monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS((metric) => console.log('CLS:', metric));
getFID((metric) => console.log('FID:', metric));
getLCP((metric) => console.log('LCP:', metric));
```

## 📞 Support

### Questions? Issues?
- **Performance questions**: Check `/docs/PerformanceOptimizations.md`
- **Implementation help**: See example in `AddProductoDisponiblePageOptimized.jsx`
- **Memory debugging**: Use hooks in `useImageMemoryManagement.js`
- **Icon issues**: Refer to `OptimizedIcons.jsx` documentation

### Code Review Checklist
When reviewing PRs with these optimizations:

- [ ] No `watch()` without field names
- [ ] `useMemo` for expensive calculations
- [ ] URL cleanup for file uploads
- [ ] Icon imports use optimized system
- [ ] Performance tests pass
- [ ] Memory usage stable

---

**Remember**: These optimizations should be transparent to users but dramatically improve performance. Test thoroughly and monitor metrics!