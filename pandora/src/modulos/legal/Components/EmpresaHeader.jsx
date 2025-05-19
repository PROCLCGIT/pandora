// src/components/EmpresaHeader.jsx
import React from "react";
import { Info, Server, Package } from "lucide-react";

const EmpresaHeader = () => {
  return (
    <div className="flex space-x-6 border-b pb-4 mb-8">
      <button className="py-2 px-4 border-b-2 border-blue-500 text-blue-500 flex items-center font-medium">
        <Info className="mr-2" size={20} /> Información de Empresas
      </button>
      <button className="py-2 px-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors">
        <Server className="mr-2" size={20} /> Acceso Servidor
      </button>
      <button className="py-2 px-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors">
        <Package className="mr-2" size={20} /> Detalles del Plan
      </button>
    </div>
  );
};

export default EmpresaHeader;
