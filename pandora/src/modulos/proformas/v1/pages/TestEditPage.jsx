import React from 'react';
import { useParams } from 'react-router-dom';

const TestEditPage = () => {
  const { id } = useParams();
  
  return (
    <div className="p-8 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-4">
        🎯 Test Edit Page Working!
      </h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg mb-2">
          <strong>Route:</strong> /proformas/edit/{id || 'NO ID'}
        </p>
        <p className="text-lg mb-2">
          <strong>ID Parameter:</strong> {id || 'undefined'}
        </p>
        <p className="text-lg mb-2">
          <strong>Current URL:</strong> {window.location.href}
        </p>
        <p className="text-lg mb-2">
          <strong>Current Pathname:</strong> {window.location.pathname}
        </p>
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-blue-800">Success!</h3>
          <p className="text-blue-700">
            If you can see this page, the route /proformas/edit/:id is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestEditPage;