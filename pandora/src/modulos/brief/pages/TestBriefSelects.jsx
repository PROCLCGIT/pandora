import React, { useState, useEffect } from 'react';
import * as briefService from '../api/briefService';
import { OriginSelect, PrioritySelect, FormaPagoSelect, DestinoSelect } from '../components/BriefFormSelects';

const TestBriefSelects = () => {
  const [choices, setChoices] = useState({
    origin: [],
    priority: [],
    forma_pago: [],
    destino: []
  });
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({
    origin: '',
    priority: 'media',
    forma_pago: '',
    destino: ''
  });

  useEffect(() => {
    loadChoices();
  }, []);

  const loadChoices = async () => {
    try {
      console.log('Loading choices...');
      const data = await briefService.getBriefChoices();
      console.log('Choices received:', data);
      setChoices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading choices:', error);
      setLoading(false);
    }
  };

  const handleChange = (field) => (value) => {
    console.log(`${field} changed to:`, value);
    setValues(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Test Brief Selects</h1>
        <p>Loading choices...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Brief Selects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Origin</label>
          <OriginSelect 
            value={values.origin}
            onChange={handleChange('origin')}
            choices={choices.origin || []}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <PrioritySelect 
            value={values.priority}
            onChange={handleChange('priority')}
            choices={choices.priority || []}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Forma de Pago</label>
          <FormaPagoSelect 
            value={values.forma_pago}
            onChange={handleChange('forma_pago')}
            choices={choices.forma_pago || []}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Destino</label>
          <DestinoSelect 
            value={values.destino}
            onChange={handleChange('destino')}
            choices={choices.destino || []}
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Current Values:</h3>
        <pre className="text-sm">{JSON.stringify(values, null, 2)}</pre>
      </div>

      <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg">
        <h3 className="font-semibold mb-2">Choices Data:</h3>
        <pre className="text-xs">{JSON.stringify(choices, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestBriefSelects;