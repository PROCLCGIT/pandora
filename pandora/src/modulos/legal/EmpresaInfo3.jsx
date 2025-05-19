import React, { useState } from "react";
import { Clipboard, PlusCircle, Info, Server, Package, Pencil } from "lucide-react";

const EmpresaInfo3 = () => {
  const [empresas, setEmpresas] = useState([
    { nombre: "Ejemplo S.A.C.", ruc: "12345678901", usuario: "admin", contraseña: "********" },
    { nombre: "Empresa 2", ruc: "98765432109", usuario: "user2", contraseña: "********" },
    { nombre: "Empresa 3", ruc: "45612378902", usuario: "user3", contraseña: "********" },
    { nombre: "Empresa 4", ruc: "32198765408", usuario: "user4", contraseña: "********" }
  ]);

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("Copiado al portapapeles: " + texto);
  };

  const agregarEmpresa = () => {
    setEmpresas([...empresas, { nombre: "Nueva Empresa", ruc: "", usuario: "", contraseña: "" }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6">Vista General</h1>
        <div className="border-b flex space-x-4 text-gray-600 mb-4">
          <button className="py-2 px-4 border-b-2 border-blue-500 text-blue-600 flex items-center">
            <Info className="mr-2" size={18} /> Información de Empresas
          </button>
          <button className="py-2 px-4 flex items-center">
            <Server className="mr-2" size={18} /> Acceso Servidor
          </button>
          <button className="py-2 px-4 flex items-center">
            <Package className="mr-2" size={18} /> Detalles del Plan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {empresas.map((empresa, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-md">
              <p className="text-lg"><strong>Nombre:</strong> {empresa.nombre}</p>
              <p className="text-lg flex justify-between items-center">
                <strong>RUC:</strong> {empresa.ruc}
                <button onClick={() => copiarAlPortapapeles(empresa.ruc)} className="ml-2 p-1 rounded hover:bg-gray-200">
                  <Clipboard size={18} />
                </button>
              </p>
              <p className="text-lg flex justify-between items-center">
                <strong>Usuario:</strong> {empresa.usuario}
                <button onClick={() => copiarAlPortapapeles(empresa.usuario)} className="ml-2 p-1 rounded hover:bg-gray-200">
                  <Clipboard size={18} />
                </button>
              </p>
              <p className="text-lg flex justify-between items-center">
                <strong>Contraseña:</strong> {empresa.contraseña}
                <div className="flex space-x-2">
                  <button onClick={() => copiarAlPortapapeles(empresa.contraseña)} className="p-1 rounded hover:bg-gray-200">
                    <Clipboard size={18} />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-200">
                    <Pencil size={18} />
                  </button>
                </div>
              </p>
            </div>
          ))}
        </div>
        <button onClick={agregarEmpresa} className="mt-6 flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
          <PlusCircle className="mr-2" size={20} /> Agregar Empresa
        </button>
      </div>
    </div>
  );
};

export default EmpresaInfo3;

