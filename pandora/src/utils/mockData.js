// Mock data para desarrollo cuando la API no está disponible o hay problemas de autenticación

export const mockCategorias = {
  count: 5,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      nombre: "Equipos Médicos",
      code: "EQP",
      parent: null,
      level: 0,
      path: "EQP",
      is_active: true
    },
    {
      id: 2,
      nombre: "Insumos",
      code: "INS",
      parent: null,
      level: 0,
      path: "INS",
      is_active: true
    },
    {
      id: 3,
      nombre: "Mobiliario",
      code: "MOB",
      parent: null,
      level: 0,
      path: "MOB",
      is_active: true
    },
    {
      id: 4,
      nombre: "Monitores",
      code: "MON",
      parent: 1,
      level: 1,
      path: "EQP/MON",
      is_active: true
    },
    {
      id: 5,
      nombre: "Respiradores",
      code: "RES",
      parent: 1,
      level: 1,
      path: "EQP/RES",
      is_active: true
    }
  ]
};

export const mockEmpresas = {
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      nombre: "CLC Corp",
      razon_social: "CLC Corporación S.A.",
      code: "CLC",
      ruc: "0991234567001",
      direccion: "Av. Principal 123",
      telefono: "+593 4 2555555",
      correo: "info@clc.com.ec",
      representante_legal: "Nombre del Representante"
    },
    {
      id: 2,
      nombre: "Tecnología Médica",
      razon_social: "Tecnología Médica Ecuador S.A.",
      code: "TME",
      ruc: "0992345678001",
      direccion: "Calle Secundaria 456",
      telefono: "+593 4 2666666",
      correo: "info@tecnomedec.com",
      representante_legal: "Representante Médico"
    },
    {
      id: 3,
      nombre: "Insumos Hospital",
      razon_social: "Insumos Hospital Cia. Ltda.",
      code: "IHC",
      ruc: "0993456789001",
      direccion: "Av. Terciaria 789",
      telefono: "+593 4 2777777",
      correo: "contacto@insumoshosp.com.ec",
      representante_legal: "Gerente Insumos"
    }
  ]
};

// Otros datos simulados pueden ser añadidos aquí según sea necesario
export const mockCiudades = {
  count: 3,
  results: [
    { id: 1, nombre: "Guayaquil", code: "GYE", provincia: "Guayas" },
    { id: 2, nombre: "Quito", code: "UIO", provincia: "Pichincha" },
    { id: 3, nombre: "Cuenca", code: "CUE", provincia: "Azuay" }
  ]
};

export const mockProcedencias = {
  count: 3,
  results: [
    { id: 1, nombre: "Nacional", code: "NAC" },
    { id: 2, nombre: "Importado", code: "IMP" },
    { id: 3, nombre: "Mixto", code: "MIX" }
  ]
};

export const mockMarcas = {
  count: 4,
  results: [
    { id: 1, nombre: "Phillips", code: "PHL", country_origin: "Holanda", is_active: true },
    { id: 2, nombre: "GE Healthcare", code: "GEH", country_origin: "USA", is_active: true },
    { id: 3, nombre: "Siemens", code: "SIE", country_origin: "Alemania", is_active: true },
    { id: 4, nombre: "Mindray", code: "MIN", country_origin: "China", is_active: true }
  ]
};

export const mockZonas = {
  count: 4,
  results: [
    { id: 1, nombre: "Costa", code: "CST", cobertura: "Región Litoral" },
    { id: 2, nombre: "Sierra", code: "SIE", cobertura: "Región Andina" },
    { id: 3, nombre: "Oriente", code: "ORI", cobertura: "Región Amazónica" },
    { id: 4, nombre: "Insular", code: "INS", cobertura: "Región Galápagos" }
  ]
};

export const mockUnidades = {
  count: 5,
  results: [
    { id: 1, nombre: "Unidad", code: "UND" },
    { id: 2, nombre: "Kilogramo", code: "KG" },
    { id: 3, nombre: "Litro", code: "LTR" },
    { id: 4, nombre: "Metro", code: "MTR" },
    { id: 5, nombre: "Caja", code: "CJA" }
  ]
};

export const mockTiposCliente = {
  count: 4,
  results: [
    { id: 1, nombre: "Hospital Público", code: "HPU" },
    { id: 2, nombre: "Hospital Privado", code: "HPR" },
    { id: 3, nombre: "Clínica", code: "CLI" },
    { id: 4, nombre: "Consultorio", code: "CON" }
  ]
};

export const mockTiposContratacion = {
  count: 3,
  results: [
    { id: 1, nombre: "Contratación Directa", code: "DIR" },
    { id: 2, nombre: "Licitación", code: "LIC" },
    { id: 3, nombre: "Subasta Inversa", code: "SUB" }
  ]
};

// Helper para simular respuestas con paginación
export const paginatedResponse = (data, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const results = data.results.slice(startIndex, endIndex);
  
  return {
    count: data.count,
    next: endIndex < data.count ? `?page=${page+1}&page_size=${pageSize}` : null,
    previous: page > 1 ? `?page=${page-1}&page_size=${pageSize}` : null,
    results: results
  };
};

// Objeto que contiene todas las colecciones de datos
export const mockData = {
  categorias: mockCategorias,
  empresas: mockEmpresas,
  ciudades: mockCiudades,
  procedencias: mockProcedencias,
  marcas: mockMarcas,
  zonas: mockZonas,
  unidades: mockUnidades,
  tiposCliente: mockTiposCliente,
  tiposContratacion: mockTiposContratacion
};