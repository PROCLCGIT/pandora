import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isFuture, isPast, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ModernCalendar = ({ 
  selected, 
  onSelect, 
  disabled = () => false,
  className 
}) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = monthStart.getDay();
  
  // Create empty cells for days before the month starts
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date) => {
    if (!disabled(date)) {
      onSelect(date);
    }
  };

  const quickSelectOptions = [
    { label: 'Hoy', getValue: () => new Date() },
    { label: '+7 días', getValue: () => addDays(new Date(), 7) },
    { label: '+15 días', getValue: () => addDays(new Date(), 15) },
    { label: '+30 días', getValue: () => addDays(new Date(), 30) },
  ];

  return (
    <div className={cn("w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden", className)}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Selected date display */}
        {selected && (
          <div className="text-center">
            <p className="text-sm opacity-80">Fecha seleccionada:</p>
            <p className="text-2xl font-bold mt-1">
              {format(selected, "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        )}
      </div>

      {/* Quick select buttons */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2 flex-wrap">
          {quickSelectOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                const date = option.getValue();
                if (!disabled(date)) {
                  handleDateClick(date);
                }
              }}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {monthDays.map((date) => {
            const isSelected = selected && isSameDay(date, selected);
            const isCurrentDay = isToday(date);
            const isDisabled = disabled(date);
            const isFutureDate = isFuture(date);
            const isPastDate = isPast(date) && !isCurrentDay;
            const isHovered = hoveredDate && isSameDay(date, hoveredDate);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isDisabled}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 relative",
                  // Base styles
                  "hover:scale-105",
                  // Default state
                  !isSelected && !isCurrentDay && !isDisabled && "hover:bg-gray-100",
                  // Selected state
                  isSelected && "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105",
                  // Today
                  isCurrentDay && !isSelected && "bg-blue-100 text-blue-700 font-bold",
                  // Disabled
                  isDisabled && "text-gray-300 cursor-not-allowed hover:scale-100",
                  // Hover effect
                  isHovered && !isSelected && !isDisabled && "bg-gray-200 shadow-md",
                  // Future dates
                  isFutureDate && !isSelected && !isDisabled && "text-gray-700",
                  // Past dates
                  isPastDate && !isSelected && !isDisabled && "text-gray-400"
                )}
              >
                <span className="relative z-10">{format(date, 'd')}</span>
                
                {/* Special indicators */}
                {isCurrentDay && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
                
                {isSelected && (
                  <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-white drop-shadow-lg" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Hoy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded"></div>
              <span>Seleccionado</span>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Mes actual
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar;