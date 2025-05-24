import { Dialog, DialogOverlay, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const StyledDialogContent = forwardRef(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] p-0 duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
StyledDialogContent.displayName = "StyledDialogContent";

export function StyledModal({ open, onOpenChange, children, title, icon = "📦" }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <StyledDialogContent>
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-[#4c63d2] to-[#5a67d8] text-white p-6">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-white/10 rounded-full transform translate-x-[30px] translate-y-[-30px]" />
          
          {/* Botón cerrar */}
          <DialogPrimitive.Close 
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-white hover:text-white rounded-lg hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar"
            asChild
          >
            <button type="button">
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </DialogPrimitive.Close>
          
          <h2 className="text-xl font-semibold flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">
              {icon}
            </div>
            {title}
          </h2>
        </div>
        
        {/* Contenido */}
        <div className="p-8">
          {children}
        </div>
      </StyledDialogContent>
    </Dialog>
  );
}

export function StyledButton({ children, variant = "primary", type = "button", className = "", ...props }) {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#4c63d2] to-[#5a67d8] text-white hover:enabled:shadow-lg hover:enabled:-translate-y-0.5 active:translate-y-0 focus:ring-[#4c63d2]",
    secondary: "bg-[#f3f4f6] text-[#374151] hover:enabled:bg-[#e5e7eb] active:bg-[#d1d5db] focus:ring-gray-400",
    success: "bg-gradient-to-r from-[#10b981] to-[#059669] text-white hover:enabled:shadow-lg hover:enabled:-translate-y-0.5 active:translate-y-0 focus:ring-[#10b981]"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function StyledInput({ label, required, error, icon, ...props }) {
  return (
    <div className="mb-6">
      <label className="block font-medium text-[#374151] mb-2 text-sm">
        {label} {required && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''}
            border-2 ${error ? 'border-[#ef4444]' : 'border-[#e5e7eb]'}
            rounded-xl text-sm
            transition-all duration-300
            bg-white
            focus:outline-none focus:border-[#4c63d2] focus:shadow-[0_0_0_3px_rgba(76,99,210,0.1)]
            focus:-translate-y-px
            placeholder:text-[#9ca3af]
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-[#ef4444] flex items-center">
          <span className="inline-block w-4 h-4 mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function StyledSelect({ label, required, error, options = [], placeholder = "Selecciona una opción", ...props }) {
  return (
    <div className="mb-6">
      <label className="block font-medium text-[#374151] mb-2 text-sm">
        {label} {required && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
      <select
        className={`
          w-full px-4 py-3
          border-2 ${error ? 'border-[#ef4444]' : 'border-[#e5e7eb]'}
          rounded-xl text-sm
          transition-all duration-300
          bg-white
          focus:outline-none focus:border-[#4c63d2] focus:shadow-[0_0_0_3px_rgba(76,99,210,0.1)]
          focus:transform focus:translate-y-[-1px]
          appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%23374151%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-[#ef4444] flex items-center">
          <span className="inline-block w-4 h-4 mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function StyledTextarea({ label, required, error, icon, rows = 3, ...props }) {
  return (
    <div className="mb-6">
      <label className="block font-medium text-[#374151] mb-2 text-sm">
        {label} {required && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}
        <textarea
          rows={rows}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''}
            border-2 ${error ? 'border-[#ef4444]' : 'border-[#e5e7eb]'}
            rounded-xl text-sm
            transition-all duration-300
            bg-white
            focus:outline-none focus:border-[#4c63d2] focus:shadow-[0_0_0_3px_rgba(76,99,210,0.1)]
            placeholder:text-[#9ca3af]
            resize-y
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-[#ef4444] flex items-center">
          <span className="inline-block w-4 h-4 mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function StyledCheckbox({ label, checked, onChange, ...props }) {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 text-[#4c63d2] bg-white border-2 border-[#e5e7eb] rounded-md focus:ring-2 focus:ring-[#4c63d2] focus:ring-offset-2 cursor-pointer"
        {...props}
      />
      <label className="text-sm font-medium text-[#374151] cursor-pointer select-none" onClick={() => onChange(!checked)}>
        {label}
      </label>
    </div>
  );
}