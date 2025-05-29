# backend/proformas/pdf_generator.py

from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime


class ProformaPDFGenerator:
    """
    Clase para generar PDFs de proformas
    """
    
    def __init__(self, proforma):
        self.proforma = proforma
        self.buffer = BytesIO()
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
        
    def _create_custom_styles(self):
        """Crea estilos personalizados para el PDF"""
        # Estilo para el título
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a365d'),
            alignment=TA_CENTER,
            spaceAfter=30,
        ))
        
        # Estilo para subtítulos
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#2c5282'),
            spaceAfter=12,
            spaceBefore=12,
        ))
        
        # Estilo para información de la empresa
        self.styles.add(ParagraphStyle(
            name='CompanyInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_RIGHT,
            textColor=colors.HexColor('#4a5568'),
        ))
        
        # Estilo para el número de proforma
        self.styles.add(ParagraphStyle(
            name='ProformaNumber',
            parent=self.styles['Normal'],
            fontSize=16,
            alignment=TA_RIGHT,
            textColor=colors.HexColor('#e53e3e'),
            fontName='Helvetica-Bold',
        ))
    
    
    def _create_client_info_table(self):
        """Crea la tabla con información del cliente"""
        cliente = self.proforma.cliente
        
        data = [
            ['INFORMACIÓN DEL CLIENTE', ''],
            ['Empresa:', cliente.nombre or 'N/A'],
            ['RUC:', cliente.ruc or 'N/A'],
            ['Dirección:', cliente.direccion or 'N/A'],
            ['Teléfono:', cliente.telefono or 'N/A'],
            ['Email:', cliente.email or 'N/A'],
            ['Atención a:', self.proforma.atencion_a or 'N/A'],
        ]
        
        table = Table(data, colWidths=[100, 400])
        table.setStyle(TableStyle([
            # Encabezado
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3182ce')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('SPAN', (0, 0), (-1, 0)),
            
            # Contenido
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f7fafc')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('GRID', (0, 1), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ]))
        
        return table
    
    def _create_items_table(self):
        """Crea la tabla de items de la proforma"""
        # Encabezados
        headers = ['#', 'Código', 'Descripción', 'Unidad', 'Cantidad', 'P. Unit.', 'Desc. %', 'Total']
        
        # Datos
        data = [headers]
        
        for idx, item in enumerate(self.proforma.items.all(), 1):
            # Manejo seguro de campos que pueden ser nulos
            unidad_nombre = getattr(item.unidad, 'nombre', 'N/A') if item.unidad else 'N/A'
            
            data.append([
                str(idx),
                item.codigo or 'N/A',
                Paragraph((item.descripcion or 'Sin descripción')[:100], self.styles['Normal']),
                unidad_nombre,
                f"{item.cantidad:,.2f}",
                f"${item.precio_unitario:,.2f}",
                f"{item.porcentaje_descuento or 0}%",
                f"${item.total:,.2f}"
            ])
        
        # Crear tabla
        col_widths = [25, 70, 200, 50, 50, 60, 40, 55]
        table = Table(data, colWidths=col_widths)
        
        # Estilos de la tabla
        table.setStyle(TableStyle([
            # Encabezado
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            
            # Contenido
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # #
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),    # Código
            ('ALIGN', (2, 1), (2, -1), 'LEFT'),    # Descripción
            ('ALIGN', (3, 1), (3, -1), 'CENTER'),  # Unidad
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'),   # Cantidad
            ('ALIGN', (5, 1), (5, -1), 'RIGHT'),   # P. Unit.
            ('ALIGN', (6, 1), (6, -1), 'CENTER'),  # Desc. %
            ('ALIGN', (7, 1), (7, -1), 'RIGHT'),   # Total
            
            # Bordes y colores
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')]),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 1), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ]))
        
        return table
    
    def _create_totals_table(self):
        """Crea la tabla de totales"""
        data = [
            ['Subtotal:', f"${self.proforma.subtotal:,.2f}"],
            [f'IVA ({self.proforma.porcentaje_impuesto}%):', f"${self.proforma.impuesto:,.2f}"],
            ['TOTAL:', f"${self.proforma.total:,.2f}"],
        ]
        
        table = Table(data, colWidths=[100, 100])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -2), 10),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#edf2f7')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        
        return table
    
    def generate(self):
        """Genera el PDF de la proforma"""
        # Configurar documento
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=50,
            leftMargin=50,
            topMargin=100,
            bottomMargin=100,
            title=f"Proforma {self.proforma.numero}"
        )
        
        # Contenido del documento
        elements = []
        
        # Información de la empresa
        empresa = self.proforma.empresa
        elements.append(Paragraph(f"<b>{empresa.nombre or 'Empresa'}</b>", self.styles['CompanyInfo']))
        elements.append(Paragraph(f"RUC: {empresa.ruc or 'N/A'}", self.styles['CompanyInfo']))
        elements.append(Paragraph(empresa.direccion or 'Dirección no especificada', self.styles['CompanyInfo']))
        telefono = getattr(empresa, 'telefono', 'N/A') or 'N/A'
        correo = getattr(empresa, 'correo', 'N/A') or 'N/A'
        elements.append(Paragraph(f"Teléfono: {telefono} | Email: {correo}", self.styles['CompanyInfo']))
        elements.append(Spacer(1, 20))
        
        # Título
        elements.append(Paragraph("PROFORMA", self.styles['CustomTitle']))
        
        # Número de proforma y fechas
        info_data = [
            [
                Paragraph(f"<b>Proforma N°:</b> {self.proforma.numero}", self.styles['ProformaNumber']),
                Paragraph(f"<b>Fecha:</b> {self.proforma.fecha_emision.strftime('%d/%m/%Y')}", self.styles['Normal'])
            ],
            [
                Paragraph(f"<b>Válida hasta:</b> {self.proforma.fecha_vencimiento.strftime('%d/%m/%Y')}", self.styles['Normal']),
                Paragraph(f"<b>Estado:</b> {self.proforma.get_estado_display()}", self.styles['Normal'])
            ]
        ]
        
        info_table = Table(info_data, colWidths=[275, 275])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 20))
        
        # Información del cliente
        elements.append(self._create_client_info_table())
        elements.append(Spacer(1, 20))
        
        # Descripción de la proforma
        elements.append(Paragraph("DETALLE DE PRODUCTOS/SERVICIOS", self.styles['CustomHeading']))
        elements.append(Spacer(1, 10))
        
        # Tabla de productos
        elements.append(self._create_items_table())
        elements.append(Spacer(1, 20))
        
        # Totales
        totals_table = self._create_totals_table()
        # Crear contenedor para alinear totales a la derecha
        container_data = [['', totals_table]]
        container = Table(container_data, colWidths=[350, 200])
        elements.append(container)
        elements.append(Spacer(1, 30))
        
        # Condiciones
        elements.append(Paragraph("CONDICIONES", self.styles['CustomHeading']))
        conditions_data = [
            ['Forma de pago:', self.proforma.condiciones_pago],
            ['Tiempo de entrega:', self.proforma.tiempo_entrega],
            ['Tipo de contratación:', self.proforma.tipo_contratacion.nombre],
        ]
        
        conditions_table = Table(conditions_data, colWidths=[120, 430])
        conditions_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        elements.append(conditions_table)
        elements.append(Spacer(1, 20))
        
        # Notas
        if self.proforma.notas:
            elements.append(Paragraph("NOTAS", self.styles['CustomHeading']))
            elements.append(Paragraph(self.proforma.notas, self.styles['Normal']))
        
        # Generar PDF
        doc.build(elements)
        
        # Retornar el buffer
        self.buffer.seek(0)
        return self.buffer