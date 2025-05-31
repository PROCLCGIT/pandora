import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MinimalSelectTest = () => {
  const [value, setValue] = useState('');
  
  // Static data to test
  const options = [
    { value: 'telefono', label: 'Telefónico' },
    { value: 'email', label: 'Correo Electrónico' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ];

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Minimal Select Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Test Select:</label>
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <p>Selected value: {value || 'None'}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Static options:</h3>
          <pre className="text-xs bg-gray-900 text-white p-2 rounded">
            {JSON.stringify(options, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MinimalSelectTest;