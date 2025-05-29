# backend/proformas/pdf_templates/classic_template.py

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import TableStyle, Paragraph, Spacer
from .base_template import BasePDFTemplate


class ClassicTemplate(BasePDFTemplate):
    """
    Template clásico/profesional con colores azules y diseño conservador
    """
    
    def get_template_name(self):
        return "Clásico"
    
    def get_template_description(self):
        return "Diseño profesional con colores azules y layout tradicional"
    
    def _create_custom_styles(self):
        """Define los estilos personalizados del template clásico"""
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
    
    def _get_client_table_style(self):
        """Estilo clásico para la tabla del cliente"""
        return TableStyle([
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
        ])
    
    def _get_items_table_style(self):
        """Estilo clásico para la tabla de items"""
        return TableStyle([
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
        ])
    
    def _get_totals_table_style(self):
        """Estilo clásico para la tabla de totales"""
        return TableStyle([
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
        ])
    
    def _create_header_elements(self):
        """Crea el header clásico con información de empresa"""
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
        
        return elements
    
    def _create_footer_elements(self):
        """Crea el footer clásico"""
        elements = []
        
        # Línea separadora
        elements.append(Spacer(1, 30))
        elements.append(Paragraph(
            "<hr width='100%'/>", 
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 10))
        
        # Texto del footer
        elements.append(Paragraph(
            "<i>Este documento es una proforma y no constituye una factura. "
            "Los precios están sujetos a cambios sin previo aviso.</i>",
            self.styles['Normal']
        ))
        
        return elements