import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as briefService from '../api/briefService';

const DebugSelectComponent = () => {
  const [choices, setChoices] = useState({});
  const [selectedValues, setSelectedValues] = useState({
    origin: '',
    priority: '',
    forma_pago: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChoices();
  }, []);

  const loadChoices = async () => {
    try {
      console.log('Loading choices...');
      const data = await briefService.getBriefChoices();
      console.log('Choices loaded:', data);
      setChoices(data);
    } catch (error) {
      console.error('Error loading choices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (field, value) => {
    console.log(`${field} changed to:`, value);
    setSelectedValues(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">Debug Select Component</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Origin Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Origin</label>
          <Select value={selectedValues.origin} onValueChange={(value) => handleValueChange('origin', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select origin..." />
            </SelectTrigger>
            <SelectContent>
              {choices.origin && choices.origin.length > 0 ? (
                choices.origin.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">No options available</div>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {choices.origin ? `${choices.origin.length} options available` : 'No data'}
          </p>
        </div>

        {/* Priority Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={selectedValues.priority} onValueChange={(value) => handleValueChange('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority..." />
            </SelectTrigger>
            <SelectContent>
              {choices.priority && choices.priority.length > 0 ? (
                choices.priority.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">No options available</div>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {choices.priority ? `${choices.priority.length} options available` : 'No data'}
          </p>
        </div>

        {/* Forma de Pago Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Forma de Pago</label>
          <Select value={selectedValues.forma_pago} onValueChange={(value) => handleValueChange('forma_pago', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method..." />
            </SelectTrigger>
            <SelectContent>
              {choices.forma_pago && choices.forma_pago.length > 0 ? (
                choices.forma_pago.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">No options available</div>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {choices.forma_pago ? `${choices.forma_pago.length} options available` : 'No data'}
          </p>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info</h3>
        <div className="space-y-1 text-sm">
          <p>Choices loaded: {Object.keys(choices).length > 0 ? 'Yes' : 'No'}</p>
          <p>Selected values: {JSON.stringify(selectedValues, null, 2)}</p>
        </div>
      </div>

      {/* Raw Data */}
      <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg">
        <h3 className="font-semibold mb-2">Raw Choices Data</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(choices, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugSelectComponent;