import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as briefService from '../api/briefService';

const TestSimpleSelect = () => {
  const [choices, setChoices] = useState({});
  const [selectedOrigin, setSelectedOrigin] = useState('');

  useEffect(() => {
    loadChoices();
  }, []);

  const loadChoices = async () => {
    try {
      const data = await briefService.getBriefChoices();
      console.log('Choices loaded:', data);
      setChoices(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Simple Select</h1>
      
      <div className="space-y-4">
        <div>
          <p>Choices loaded: {Object.keys(choices).length > 0 ? 'Yes' : 'No'}</p>
          <p>Origin options: {choices.origin?.length || 0}</p>
        </div>

        <div className="w-64">
          <label className="block mb-2">Origin:</label>
          <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
            <SelectTrigger>
              <SelectValue placeholder="Select origin..." />
            </SelectTrigger>
            <SelectContent>
              {choices.origin?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p>Selected: {selectedOrigin || 'None'}</p>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(choices, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default TestSimpleSelect;