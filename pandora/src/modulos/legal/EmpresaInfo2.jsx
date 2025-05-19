import React, { useEffect, useState } from "react";
import { Clipboard, PlusCircle, Info, Server, Package, Pencil, Eye, EyeOff, X, Check, AlertCircle, Save, UserPlus, Building, Globe } from "lucide-react";
import api from '@/config/axios'; // Usamos la instancia de axios ya configurada

const EmpresaInfo2 = () => {
  console.log("EmpresaInfo2 - Iniciando componente");
  const [empresas, setEmpresas] = useState([]);
  const [mostrarContrasenas, setMostrarContrasenas] = useState({});
  const [notificacion, setNotificacion] = useState(null);
  const [editando, setEditando] = useState(null);
  const [valorEditado, setValorEditado] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tabActiva, setTabActiva] = useState("sri"); // 'sri' o 'sercop'
  const [nuevaEmpresa, setNuevaEmpresa] = useState({
    empresa: "",
    ruc: "",
    usuario: "",
    contrasena: "",
    correo: "",
    telefono: "",
    representante: "",
    institucion: "",  // Campo adicional para otrasinstituciones
    url: ""           // Campo adicional para otrasinstituciones
  });

  // Cargar las empresas cuando cambie la pestaña activa
  useEffect(() => {
    console.log(`EmpresaInfo2 - Cargando empresas de ${tabActiva}...`);
    cargarEmpresas();
    
    // Resetear estados cuando cambia la pestaña
    setMostrarFormulario(false);
    setMostrarContrasenas({});
    setEditando(null);
  }, [tabActiva]);

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      const endpoint = `/blegal/${tabActiva}/`;
      console.log(`Cargando datos desde: ${endpoint}`);
      
      const response = await api.get(endpoint);
      console.log("Respuesta del API:", response.data);
      
      // Si la respuesta está paginada, se encuentra en results; de lo contrario, se asume que es un objeto único
      let resultados = response.data.results || response.data;
      if (!Array.isArray(resultados)) {
        resultados = [resultados];
      }
      const data = resultados.map(item => ({
        id: item.id,
        nombre: item.empresa,        // mapeamos 'empresa' a 'nombre'
        ruc: item.ruc,
        usuario: item.usuario,
        contraseña: item.contrasena,  // mapeamos 'contrasena' a 'contraseña'
        correo: item.correo,
        telefono: item.telefono,
        representante: item.representante,
        fecha_creacion: item.fecha_creacion,
        fecha_actualizacion: item.fecha_actualizacion,
      }));
      
      console.log(`Datos formateados de ${tabActiva}:`, data);
      setEmpresas(data);
    } catch (error) {
      console.error(`Error al cargar las empresas de ${tabActiva}:`, error);
      mostrarNotificacion(`Error al cargar datos de ${tabActiva.toUpperCase()}`);
      setEmpresas([]); // Limpiar los datos en caso de error
    } finally {
      setLoading(false);
    }
  };

  const copiarAlPortapapeles = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    mostrarNotificacion(`${tipo} copiado al portapapeles`);
  };

  const mostrarNotificacion = (mensaje) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 2000);
  };

  const toggleMostrarContrasena = (index) => {
    setMostrarContrasenas({
      ...mostrarContrasenas,
      [index]: !mostrarContrasenas[index]
    });
  };

  // Iniciar edición de un campo
  const iniciarEdicion = (index, campo, valor) => {
    setEditando({ index, campo });
    setValorEditado(valor);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setValorEditado("");
  };

  // Guardar la edición actualizando el backend
  const guardarEdicion = async (empresa, campo) => {
    try {
      const endpoint = `/blegal/${tabActiva}/${empresa.id}/`;
      
      // Preparar los datos según el tipo de entidad
      const datosActualizados = {
        empresa: campo === "nombre" ? valorEditado : empresa.nombre,
        ruc: campo === "ruc" ? valorEditado : empresa.ruc,
        usuario: campo === "usuario" ? valorEditado : empresa.usuario,
        contrasena: campo === "contraseña" ? valorEditado : empresa.contraseña,
        correo: campo === "correo" ? valorEditado : empresa.correo,
        telefono: campo === "telefono" ? valorEditado : empresa.telefono,
        representante: campo === "representante" ? valorEditado : empresa.representante,
      };
      
      // Agregar campos específicos para otras instituciones si corresponde
      if (tabActiva === 'otrasinstituciones') {
        datosActualizados.institucion = campo === "institucion" ? valorEditado : (empresa.institucion || "");
        datosActualizados.url = campo === "url" ? valorEditado : (empresa.url || "");
      }
      
      // Realizar la petición PUT
      await api.put(endpoint, datosActualizados);
      
      setEmpresas(empresas.map(e => (e.id === empresa.id ? { ...e, [campo]: valorEditado } : e)));
      mostrarNotificacion("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar la empresa:", error);
      mostrarNotificacion("Error al actualizar la empresa: " + (error.response?.data?.detail || error.message));
    } finally {
      cancelarEdicion();
    }
  };

  // Manejar cambios en el formulario de nueva empresa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaEmpresa({
      ...nuevaEmpresa,
      [name]: value
    });
  };

  // Validar formulario antes de enviar
  const validarFormulario = () => {
    if (!nuevaEmpresa.empresa || !nuevaEmpresa.ruc || !nuevaEmpresa.usuario) {
      mostrarNotificacion("Empresa, RUC y Usuario son campos obligatorios");
      return false;
    }
    
    // Validar formato de RUC (ejemplo simple)
    if (!/^\d{11}$/.test(nuevaEmpresa.ruc)) {
      mostrarNotificacion("El RUC debe tener 11 dígitos");
      return false;
    }
    
    // Validar formato de correo
    if (nuevaEmpresa.correo && !/\S+@\S+\.\S+/.test(nuevaEmpresa.correo)) {
      mostrarNotificacion("Formato de correo electrónico inválido");
      return false;
    }
    
    // Validaciones específicas para Otras Instituciones
    if (tabActiva === 'otrasinstituciones') {
      if (!nuevaEmpresa.institucion) {
        mostrarNotificacion("El campo Institución es obligatorio para Otras Instituciones");
        return false;
      }
      
      // Validar formato de URL si está presente
      if (nuevaEmpresa.url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(nuevaEmpresa.url)) {
        mostrarNotificacion("Formato de URL inválido");
        return false;
      }
    }
    
    return true;
  };

  // Función para agregar una nueva empresa
  const agregarEmpresa = async () => {
    if (mostrarFormulario) {
      if (!validarFormulario()) return;
      
      try {
        const endpoint = `/blegal/${tabActiva}/`;
        console.log(`Guardando empresa en ${endpoint}`, nuevaEmpresa);
        
        const response = await api.post(endpoint, nuevaEmpresa);
        const empresaCreada = {
          id: response.data.id,
          nombre: response.data.empresa,
          ruc: response.data.ruc,
          usuario: response.data.usuario,
          contraseña: response.data.contrasena,
          correo: response.data.correo,
          telefono: response.data.telefono,
          representante: response.data.representante,
          fecha_creacion: response.data.fecha_creacion,
          fecha_actualizacion: response.data.fecha_actualizacion,
        };
        setEmpresas([...empresas, empresaCreada]);
        mostrarNotificacion("Empresa agregada correctamente");
        
        // Restablecer formulario
        setNuevaEmpresa({
          empresa: "",
          ruc: "",
          usuario: "",
          contrasena: "",
          correo: "",
          telefono: "",
          representante: "",
          institucion: "",
          url: ""
        });
        setMostrarFormulario(false);
      } catch (error) {
        console.error("Error al agregar empresa:", error);
        mostrarNotificacion("Error al agregar empresa: " + (error.response?.data?.detail || error.message));
      }
    } else {
      // Si no estamos mostrando el formulario, mostrarlo
      setMostrarFormulario(true);
    }
  };
  
  // Cancelar creación de nueva empresa
  const cancelarNuevaEmpresa = () => {
    setMostrarFormulario(false);
    setNuevaEmpresa({
      empresa: "",
      ruc: "",
      usuario: "",
      contrasena: "",
      correo: "",
      telefono: "",
      representante: "",
      institucion: "",
      url: ""
    });
  };

  // Función para eliminar una empresa
  const eliminarEmpresa = async (empresaId) => {
    try {
      const endpoint = `/blegal/${tabActiva}/${empresaId}/`;
      await api.delete(endpoint);
      setEmpresas(empresas.filter(e => e.id !== empresaId));
      mostrarNotificacion("Empresa eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      mostrarNotificacion("Error al eliminar empresa: " + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) return <p>Cargando empresas...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {notificacion && (
          <div className={`fixed top-4 right-4 ${notificacion.includes("Error") ? "bg-red-500" : "bg-green-500"} text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50`}>
            {notificacion.includes("Error") ? <AlertCircle size={18} className="mr-2" /> : <Check size={18} className="mr-2" />}
            {notificacion}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <h1 className="text-3xl font-bold">Panel de Gestión Empresarial</h1>
            <p className="text-blue-100 mt-2">Administre la información de sus empresas fácilmente</p>
          </div>

          <div className="border-b bg-white sticky top-0 z-10">
            <div className="flex space-x-1 px-6">
              <button 
                onClick={() => setTabActiva('sri')}
                className={`py-4 px-6 flex items-center ${tabActiva === 'sri' 
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
              >
                <Info className="mr-2" size={18} /> SRI
              </button>
              <button 
                onClick={() => setTabActiva('sercop')}
                className={`py-4 px-6 flex items-center ${tabActiva === 'sercop' 
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
              >
                <Server className="mr-2" size={18} /> SERCOP
              </button>
              <button 
                onClick={() => setTabActiva('supercom')}
                className={`py-4 px-6 flex items-center ${tabActiva === 'supercom' 
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
              >
                <Package className="mr-2" size={18} /> SUPERCOM
              </button>
              <button 
                onClick={() => setTabActiva('otrasinstituciones')}
                className={`py-4 px-6 flex items-center ${tabActiva === 'otrasinstituciones' 
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
              >
                <Building className="mr-2" size={18} /> Otras Instituciones
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {empresas.map((empresa, index) => (
                <div key={empresa.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-800">{empresa.nombre}</h3>
                    <button 
                      onClick={() => eliminarEmpresa(empresa.id)} 
                      className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {/* Campo EMPRESA */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">EMPRESA</label>
                      {editando && editando.index === index && editando.campo === "nombre" ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={valorEditado}
                            onChange={(e) => setValorEditado(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => guardarEdicion(empresa, "nombre")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelarEdicion} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="text-gray-800">{empresa.nombre}</span>
                          <button 
                            onClick={() => iniciarEdicion(index, "nombre", empresa.nombre)} 
                            className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 rounded"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Campo RUC */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">RUC</label>
                      {editando && editando.index === index && editando.campo === "ruc" ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={valorEditado}
                            onChange={(e) => setValorEditado(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => guardarEdicion(empresa, "ruc")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelarEdicion} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="text-gray-800 font-mono">{empresa.ruc}</span>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => copiarAlPortapapeles(empresa.ruc, "RUC")} 
                              className="p-1 text-gray-400 hover:text-blue-500 rounded"
                              title="Copiar RUC"
                            >
                              <Clipboard size={16} />
                            </button>
                            <button 
                              onClick={() => iniciarEdicion(index, "ruc", empresa.ruc)} 
                              className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 rounded"
                            >
                              <Pencil size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Campo USUARIO */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">USUARIO</label>
                      {editando && editando.index === index && editando.campo === "usuario" ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={valorEditado}
                            onChange={(e) => setValorEditado(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => guardarEdicion(empresa, "usuario")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelarEdicion} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="text-gray-800 font-mono">{empresa.usuario}</span>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => copiarAlPortapapeles(empresa.usuario, "Usuario")} 
                              className="p-1 text-gray-400 hover:text-blue-500 rounded"
                              title="Copiar usuario"
                            >
                              <Clipboard size={16} />
                            </button>
                            <button 
                              onClick={() => iniciarEdicion(index, "usuario", empresa.usuario)} 
                              className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 rounded"
                            >
                              <Pencil size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Campo CONTRASEÑA */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">CONTRASEÑA</label>
                      {editando && editando.index === index && editando.campo === "contraseña" ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={valorEditado}
                            onChange={(e) => setValorEditado(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => guardarEdicion(empresa, "contraseña")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelarEdicion} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="text-gray-800 font-mono">
                            {mostrarContrasenas[index] ? empresa.contraseña : "••••••••"}
                          </span>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => toggleMostrarContrasena(index)} 
                              className="p-1 text-gray-400 hover:text-blue-500 rounded"
                              title={mostrarContrasenas[index] ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                              {mostrarContrasenas[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button 
                              onClick={() => copiarAlPortapapeles(empresa.contraseña, "Contraseña")} 
                              className="p-1 text-gray-400 hover:text-blue-500 rounded"
                              title="Copiar contraseña"
                            >
                              <Clipboard size={16} />
                            </button>
                            <button 
                              onClick={() => iniciarEdicion(index, "contraseña", empresa.contraseña)} 
                              className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 rounded"
                            >
                              <Pencil size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Campo CORREO */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">CORREO</label>
                      {editando && editando.index === index && editando.campo === "correo" ? (
                        <div className="flex space-x-2">
                          <input
                            type="email"
                            value={valorEditado}
                            onChange={(e) => setValorEditado(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => guardarEdicion(empresa, "correo")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelarEdicion} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="text-gray-800">{empresa.correo}</span>
                          <button 
                            onClick={() => iniciarEdicion(index, "correo", empresa.correo)} 
                            className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 rounded"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Campo TELÉFONO */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">TELÉFONO</label>
                      {editando && editando.index === index && editando.campo === "telefono" ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={valorEditado}
                            onChange={(e) => setValorEditado(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => guardarEdicion(empresa, "telefono")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelarEdicion} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="text-gray-800">{empresa.telefono}</span>
                          <button 
                            onClick={() => iniciarEdicion(index, "telefono", empresa.telefono)} 
                            className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 rounded"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Campo REPRESENTANTE */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">REPRESENTANTE</label>
                      {editando && editando.index === index && editando.campo === "representante" ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={valorEditado}
                            onChange={(e) => setValorEditado(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => guardarEdicion(empresa, "representante")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelarEdicion} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="text-gray-800">{empresa.representante}</span>
                          <button 
                            onClick={() => iniciarEdicion(index, "representante", empresa.representante)} 
                            className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 rounded"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
            
            {/* Formulario para agregar nueva empresa */}
            {mostrarFormulario && (
              <div className="mt-6 bg-white p-6 border border-blue-200 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                    <UserPlus className="mr-2" size={20} />
                    Agregar Nueva Empresa
                  </h3>
                  <button 
                    onClick={cancelarNuevaEmpresa}
                    className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campos obligatorios con asterisco */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Empresa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="empresa"
                      value={nuevaEmpresa.empresa}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre de la empresa"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      RUC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ruc"
                      value={nuevaEmpresa.ruc}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="RUC (11 dígitos)"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="usuario"
                      value={nuevaEmpresa.usuario}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre de usuario"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="contrasena"
                      value={nuevaEmpresa.contrasena}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contraseña"
                      required
                    />
                  </div>
                  
                  {/* Campos opcionales */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="correo"
                      value={nuevaEmpresa.correo}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      name="telefono"
                      value={nuevaEmpresa.telefono}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Número de teléfono"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Representante
                    </label>
                    <input
                      type="text"
                      name="representante"
                      value={nuevaEmpresa.representante}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del representante"
                    />
                  </div>
                  
                  {/* Campos adicionales solo para Otras Instituciones */}
                  {tabActiva === 'otrasinstituciones' && (
                    <>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Institución <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="institucion"
                          value={nuevaEmpresa.institucion}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre de la institución"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <input
                          type="url"
                          name="url"
                          value={nuevaEmpresa.url}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://ejemplo.com"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={cancelarNuevaEmpresa}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={agregarEmpresa}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save size={16} className="mr-2" /> 
                    Guardar Empresa
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 flex items-start">
                  <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
                  <span>Los campos marcados con <span className="text-red-500">*</span> son obligatorios. El RUC debe tener 11 dígitos numéricos.</span>
                </div>
              </div>
            )}
            
            {/* Botón para mostrar/ocultar formulario */}
            <button 
              onClick={agregarEmpresa} 
              className="mt-6 flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
            >
              <PlusCircle className="mr-2" size={20} /> 
              {mostrarFormulario ? "Guardar Empresa" : "Agregar Empresa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaInfo2;
