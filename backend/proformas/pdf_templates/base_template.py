# backend/proformas/pdf_templates/base_template.py

from abc import ABC, abstractmethod
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT


class BasePDFTemplate(ABC):
    """
    Clase base abstracta para templates de PDF de proformas.
    Cada template específico debe heredar de esta clase e implementar
    los métodos abstractos para definir su propio estilo.
    """
    
    def __init__(self, proforma):
        self.proforma = proforma
        self.buffer = BytesIO()
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
        
    @abstractmethod
    def _create_custom_styles(self):
        """Define los estilos personalizados del template"""
        pass
    
    @abstractmethod
    def get_template_name(self):
        """Retorna el nombre del template"""
        pass
    
    @abstractmethod
    def get_template_description(self):
        """Retorna la descripción del template"""
        pass
    
    def _create_client_info_table(self):
        """Crea la tabla con información del cliente - puede ser sobrescrita"""
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
        table.setStyle(self._get_client_table_style())
        return table
    
    def _create_items_table(self):
        """Crea la tabla de items - puede ser sobrescrita"""
        headers = ['#', 'Código', 'Descripción', 'Unidad', 'Cantidad', 'P. Unit.', 'Desc. %', 'Total']
        data = [headers]
        
        for idx, item in enumerate(self.proforma.items.all(), 1):
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
        
        col_widths = [25, 70, 200, 50, 50, 60, 40, 55]
        table = Table(data, colWidths=col_widths)
        table.setStyle(self._get_items_table_style())
        return table
    
    def _create_totals_table(self):
        """Crea la tabla de totales - puede ser sobrescrita"""
        data = [
            ['Subtotal:', f"${self.proforma.subtotal:,.2f}"],
            [f'IVA ({self.proforma.porcentaje_impuesto}%):', f"${self.proforma.impuesto:,.2f}"],
            ['TOTAL:', f"${self.proforma.total:,.2f}"],
        ]
        
        table = Table(data, colWidths=[100, 100])
        table.setStyle(self._get_totals_table_style())
        return table
    
    @abstractmethod
    def _get_client_table_style(self):
        """Define el estilo de la tabla del cliente"""
        pass
    
    @abstractmethod
    def _get_items_table_style(self):
        """Define el estilo de la tabla de items"""
        pass
    
    @abstractmethod
    def _get_totals_table_style(self):
        """Define el estilo de la tabla de totales"""
        pass
    
    @abstractmethod
    def _create_header_elements(self):
        """Crea los elementos del header - debe ser implementado por cada template"""
        pass
    
    @abstractmethod
    def _create_footer_elements(self):
        """Crea los elementos del footer - debe ser implementado por cada template"""
        pass
    
    def generate(self):
        """Genera el PDF usando el template específico"""
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
        
        # Header (implementado por cada template)
        elements.extend(self._create_header_elements())
        
        # Título
        elements.append(Paragraph("PROFORMA", self.styles['CustomTitle']))
        
        # Información de la proforma
        elements.extend(self._create_proforma_info())
        elements.append(Spacer(1, 20))
        
        # Información del cliente
        elements.append(self._create_client_info_table())
        elements.append(Spacer(1, 20))
        
        # Descripción de productos
        elements.append(Paragraph("DETALLE DE PRODUCTOS/SERVICIOS", self.styles['CustomHeading']))
        elements.append(Spacer(1, 10))
        
        # Tabla de productos
        elements.append(self._create_items_table())
        elements.append(Spacer(1, 20))
        
        # Totales
        totals_table = self._create_totals_table()
        container_data = [['', totals_table]]
        container = Table(container_data, colWidths=[350, 200])
        elements.append(container)
        elements.append(Spacer(1, 30))
        
        # Condiciones
        elements.extend(self._create_conditions_section())
        
        # Footer (implementado por cada template)
        elements.extend(self._create_footer_elements())
        
        # Generar PDF
        doc.build(elements)
        
        # Retornar el buffer
        self.buffer.seek(0)
        return self.buffer
    
    def _create_proforma_info(self):
        """Crea la sección de información de la proforma"""
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
        
        return [info_table]
    
    def _create_conditions_section(self):
        """Crea la sección de condiciones"""
        elements = []
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
        
        return elements