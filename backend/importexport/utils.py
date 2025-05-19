import pandas as pd
import numpy as np
from django.db import transaction
from productos.models import (
    ProductoOfertado, ProductoDisponible, ImagenProductoDisponible,
    DocumentoProductoDisponible, ProductsPrice
)
from basic.models import Categoria, Marca, Unidad, Procedencia, EmpresaClc

def validar_dataframe_productos_ofertados(df):
    """Valida el dataframe de productos ofertados"""
    errores = []
    # Verificar columnas requeridas
    columnas_requeridas = ['code', 'cudim', 'nombre', 'id_categoria']
    for col in columnas_requeridas:
        if col not in df.columns:
            errores.append(f"La columna {col} es obligatoria")
    
    # Verificar duplicados en campos únicos
    if 'code' in df.columns and df['code'].duplicated().any():
        duplicados = df[df['code'].duplicated(keep=False)]['code'].unique()
        errores.append(f"Códigos duplicados: {', '.join(duplicados)}")
    
    if 'cudim' in df.columns and df['cudim'].duplicated().any():
        duplicados = df[df['cudim'].duplicated(keep=False)]['cudim'].unique()
        errores.append(f"CUDIMs duplicados: {', '.join(duplicados)}")
    
    # Validar referencias a categorías
    if 'id_categoria' in df.columns:
        categorias = list(Categoria.objects.values_list('id', flat=True))
        categorias_invalidas = df[~df['id_categoria'].isin(categorias)]['id_categoria'].unique()
        if len(categorias_invalidas) > 0:
            errores.append(f"Categorías no encontradas: {', '.join(map(str, categorias_invalidas))}")
    
    return errores

def validar_dataframe_productos_disponibles(df):
    """Valida el dataframe de productos disponibles"""
    errores = []
    # Verificar columnas requeridas
    columnas_requeridas = ['code', 'nombre', 'id_categoria', 'id_producto_ofertado', 'id_marca', 'modelo']
    for col in columnas_requeridas:
        if col not in df.columns:
            errores.append(f"La columna {col} es obligatoria")
    
    # Verificar duplicados en campos únicos
    if 'code' in df.columns and df['code'].duplicated().any():
        duplicados = df[df['code'].duplicated(keep=False)]['code'].unique()
        errores.append(f"Códigos duplicados: {', '.join(duplicados)}")
    
    # Validar referencias
    if 'id_categoria' in df.columns:
        categorias = list(Categoria.objects.values_list('id', flat=True))
        categorias_invalidas = df[~df['id_categoria'].isin(categorias)]['id_categoria'].unique()
        if len(categorias_invalidas) > 0:
            errores.append(f"Categorías no encontradas: {', '.join(map(str, categorias_invalidas))}")
    
    if 'id_producto_ofertado' in df.columns:
        productos = list(ProductoOfertado.objects.values_list('id', flat=True))
        productos_invalidos = df[~df['id_producto_ofertado'].isin(productos)]['id_producto_ofertado'].unique()
        if len(productos_invalidos) > 0:
            errores.append(f"Productos ofertados no encontrados: {', '.join(map(str, productos_invalidos))}")
    
    if 'id_marca' in df.columns:
        marcas = list(Marca.objects.values_list('id', flat=True))
        marcas_invalidas = df[~df['id_marca'].isin(marcas)]['id_marca'].unique()
        if len(marcas_invalidas) > 0:
            errores.append(f"Marcas no encontradas: {', '.join(map(str, marcas_invalidas))}")
    
    return errores

@transaction.atomic
def importar_productos_ofertados(df, usuario):
    """Importa productos ofertados desde un dataframe"""
    resultados = {
        'exitosos': 0,
        'fallidos': 0,
        'errores': []
    }
    
    for _, row in df.iterrows():
        try:
            # Convertir NaN a None
            row_dict = {k: (None if pd.isna(v) else v) for k, v in row.to_dict().items()}
            
            # Buscar si ya existe el producto por código
            producto_existente = ProductoOfertado.objects.filter(code=row_dict['code']).first()
            
            if producto_existente:
                # Actualizar producto existente
                for campo, valor in row_dict.items():
                    if campo != 'code' and hasattr(producto_existente, campo):
                        if campo == 'id_categoria':
                            categoria = Categoria.objects.get(id=valor)
                            setattr(producto_existente, campo, categoria)
                        else:
                            setattr(producto_existente, campo, valor)
                
                producto_existente.updated_by = usuario
                producto_existente.save()
            else:
                # Crear nuevo producto
                categoria = Categoria.objects.get(id=row_dict['id_categoria'])
                
                nuevo_producto = ProductoOfertado(
                    id_categoria=categoria,
                    code=row_dict['code'],
                    cudim=row_dict['cudim'],
                    nombre=row_dict['nombre'],
                    descripcion=row_dict.get('descripcion', ''),
                    especialidad=row_dict.get('especialidad', ''),
                    referencias=row_dict.get('referencias', ''),
                    is_active=row_dict.get('is_active', True),
                    created_by=usuario,
                    updated_by=usuario
                )
                nuevo_producto.save()
            
            resultados['exitosos'] += 1
            
        except Exception as e:
            resultados['fallidos'] += 1
            resultados['errores'].append(f"Error en fila {_ + 2}: {str(e)}")
    
    return resultados

@transaction.atomic
def importar_productos_disponibles(df, usuario):
    """Importa productos disponibles desde un dataframe"""
    resultados = {
        'exitosos': 0,
        'fallidos': 0,
        'errores': []
    }
    
    for _, row in df.iterrows():
        try:
            # Convertir NaN a None
            row_dict = {k: (None if pd.isna(v) else v) for k, v in row.to_dict().items()}
            
            # Buscar si ya existe el producto por código
            producto_existente = ProductoDisponible.objects.filter(code=row_dict['code']).first()
            
            if producto_existente:
                # Actualizar producto existente
                for campo, valor in row_dict.items():
                    if campo != 'code' and hasattr(producto_existente, campo):
                        if campo == 'id_categoria':
                            categoria = Categoria.objects.get(id=valor)
                            setattr(producto_existente, campo, categoria)
                        elif campo == 'id_producto_ofertado':
                            producto_ofertado = ProductoOfertado.objects.get(id=valor)
                            setattr(producto_existente, campo, producto_ofertado)
                        elif campo == 'id_marca':
                            marca = Marca.objects.get(id=valor)
                            setattr(producto_existente, campo, marca)
                        elif campo == 'unidad_presentacion':
                            unidad = Unidad.objects.get(id=valor)
                            setattr(producto_existente, campo, unidad)
                        elif campo == 'procedencia':
                            procedencia = Procedencia.objects.get(id=valor)
                            setattr(producto_existente, campo, procedencia)
                        else:
                            setattr(producto_existente, campo, valor)
                
                producto_existente.updated_by = usuario
                producto_existente.save()
                
                # Registrar precio actual si ha cambiado
                if ('precio_venta_privado' in row_dict and 
                    producto_existente.precio_venta_privado != row_dict['precio_venta_privado']):
                    ProductsPrice.objects.create(
                        producto_disponible=producto_existente,
                        valor=row_dict['precio_venta_privado']
                    )
            else:
                # Crear nuevo producto
                categoria = Categoria.objects.get(id=row_dict['id_categoria'])
                producto_ofertado = ProductoOfertado.objects.get(id=row_dict['id_producto_ofertado'])
                marca = Marca.objects.get(id=row_dict['id_marca'])
                unidad = Unidad.objects.get(id=row_dict.get('unidad_presentacion'))
                procedencia = Procedencia.objects.get(id=row_dict.get('procedencia'))
                
                nuevo_producto = ProductoDisponible(
                    id_categoria=categoria,
                    id_producto_ofertado=producto_ofertado,
                    id_marca=marca,
                    unidad_presentacion=unidad,
                    procedencia=procedencia,
                    code=row_dict['code'],
                    nombre=row_dict['nombre'],
                    modelo=row_dict.get('modelo', ''),
                    referencia=row_dict.get('referencia', ''),
                    costo_referencial=row_dict.get('costo_referencial', 0),
                    precio_sie_referencial=row_dict.get('precio_sie_referencial', 0),
                    precio_sie_tipob=row_dict.get('precio_sie_tipob', 0),
                    precio_venta_privado=row_dict.get('precio_venta_privado', 0),
                    is_active=row_dict.get('is_active', True),
                    created_by=usuario,
                    updated_by=usuario
                )
                nuevo_producto.save()
                
                # Registrar precio inicial
                if row_dict.get('precio_venta_privado'):
                    ProductsPrice.objects.create(
                        producto_disponible=nuevo_producto,
                        valor=row_dict['precio_venta_privado']
                    )
            
            resultados['exitosos'] += 1
            
        except Exception as e:
            resultados['fallidos'] += 1
            resultados['errores'].append(f"Error en fila {_ + 2}: {str(e)}")
    
    return resultados

def exportar_productos_ofertados():
    """Exporta todos los productos ofertados a un DataFrame"""
    productos = ProductoOfertado.objects.all()
    
    data = []
    for producto in productos:
        data.append({
            'id': producto.id,
            'code': producto.code,
            'cudim': producto.cudim,
            'nombre': producto.nombre,
            'id_categoria': producto.id_categoria_id,
            'categoria': producto.id_categoria.nombre if producto.id_categoria else '',
            'descripcion': producto.descripcion,
            'especialidad': producto.especialidad,
            'referencias': producto.referencias,
            'is_active': producto.is_active,
            'created_at': producto.created_at,
            'updated_at': producto.updated_at
        })
    
    return pd.DataFrame(data)

def exportar_productos_disponibles():
    """Exporta todos los productos disponibles a un DataFrame"""
    productos = ProductoDisponible.objects.all()
    
    data = []
    for producto in productos:
        data.append({
            'id': producto.id,
            'code': producto.code,
            'nombre': producto.nombre,
            'id_categoria': producto.id_categoria_id,
            'categoria': producto.id_categoria.nombre if producto.id_categoria else '',
            'id_producto_ofertado': producto.id_producto_ofertado_id,
            'producto_ofertado': producto.id_producto_ofertado.nombre if producto.id_producto_ofertado else '',
            'id_marca': producto.id_marca_id,
            'marca': producto.id_marca.nombre if producto.id_marca else '',
            'modelo': producto.modelo,
            'unidad_presentacion': producto.unidad_presentacion_id,
            'unidad': producto.unidad_presentacion.nombre if producto.unidad_presentacion else '',
            'procedencia': producto.procedencia_id,
            'pais_procedencia': producto.procedencia.nombre if producto.procedencia else '',
            'referencia': producto.referencia,
            'costo_referencial': producto.costo_referencial,
            'precio_sie_referencial': producto.precio_sie_referencial,
            'precio_sie_tipob': producto.precio_sie_tipob,
            'precio_venta_privado': producto.precio_venta_privado,
            'is_active': producto.is_active,
            'created_at': producto.created_at,
            'updated_at': producto.updated_at
        })
    
    return pd.DataFrame(data)
