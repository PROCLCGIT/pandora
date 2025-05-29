# backend/proformas/pdf_templates/modern_template.py

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import TableStyle, Paragraph, Spacer
from .base_template import BasePDFTemplate


class ModernTemplate(BasePDFTemplate):
    """
    Template moderno con colores verdes y diseño limpio
    """
    
    def get_template_name(self):
        return "Moderno"
    
    def get_template_description(self):
        return "Diseño contemporáneo con colores verdes y layout minimalista"
    
    def _create_custom_styles(self):
        """Define los estilos personalizados del template moderno"""
        # Estilo para el título
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#065f46'),
            alignment=TA_CENTER,
            spaceAfter=40,
            fontName='Helvetica-Bold',
        ))
        
        # Estilo para subtítulos
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#047857'),
            spaceAfter=15,
            spaceBefore=15,
            fontName='Helvetica-Bold',
        ))
        
        # Estilo para información de la empresa
        self.styles.add(ParagraphStyle(
            name='CompanyInfo',
            parent=self.styles['Normal'],
            fontSize=11,
            alignment=TA_RIGHT,
            textColor=colors.HexColor('#374151'),
        ))
        
        # Estilo para el número de proforma
        self.styles.add(ParagraphStyle(
            name='ProformaNumber',
            parent=self.styles['Normal'],
            fontSize=18,
            alignment=TA_RIGHT,
            textColor=colors.HexColor('#dc2626'),
            fontName='Helvetica-Bold',
        ))
    
    def _get_client_table_style(self):
        """Estilo moderno para la tabla del cliente"""
        return TableStyle([
            # Encabezado
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 13),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 15),
            ('TOPPADDING', (0, 0), (-1, 0), 15),
            ('SPAN', (0, 0), (-1, 0)),
            
            # Contenido
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#ecfdf5')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
            ('ALIGN', (0, 1), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('GRID', (0, 1), (-1, -1), 1, colors.HexColor('#d1fae5')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ])
    
    def _get_items_table_style(self):
        """Estilo moderno para la tabla de items"""
        return TableStyle([
            # Encabezado
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            
            # Contenido
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # #
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),    # Código
            ('ALIGN', (2, 1), (2, -1), 'LEFT'),    # Descripción
            ('ALIGN', (3, 1), (3, -1), 'CENTER'),  # Unidad
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'),   # Cantidad
            ('ALIGN', (5, 1), (5, -1), 'RIGHT'),   # P. Unit.
            ('ALIGN', (6, 1), (6, -1), 'CENTER'),  # Desc. %
            ('ALIGN', (7, 1), (7, -1), 'RIGHT'),   # Total
            
            # Bordes y colores
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ])
    
    def _get_totals_table_style(self):
        """Estilo moderno para la tabla de totales"""
        return TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -2), 11),
            ('FONTSIZE', (0, -1), (-1, -1), 14),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#065f46')),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ecfdf5')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1fae5')),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ])
    
    def _create_header_elements(self):
        """Crea el header moderno con barra de color"""
        elements = []
        
        # Barra superior decorativa (simulada con una tabla)
        header_data = [[''], ['']]
        header_table = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#34d399')),
        ])
        
        # Información de la empresa con diseño moderno
        empresa = self.proforma.empresa
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"<b>{empresa.nombre or 'Empresa'}</b>", self.styles['CompanyInfo']))
        elements.append(Paragraph(f"RUC: {empresa.ruc or 'N/A'}", self.styles['CompanyInfo']))
        elements.append(Paragraph(empresa.direccion or 'Dirección no especificada', self.styles['CompanyInfo']))
        telefono = getattr(empresa, 'telefono', 'N/A') or 'N/A'
        correo = getattr(empresa, 'correo', 'N/A') or 'N/A'
        elements.append(Paragraph(f"📞 {telefono} | ✉ {correo}", self.styles['CompanyInfo']))
        elements.append(Spacer(1, 30))
        
        return elements
    
    def _create_footer_elements(self):
        """Crea el footer moderno"""
        elements = []
        
        # Espaciado
        elements.append(Spacer(1, 40))
        
        # Footer con diseño moderno
        footer_style = ParagraphStyle(
            name='ModernFooter',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#6b7280'),
            alignment=TA_CENTER,
        )
        
        elements.append(Paragraph(
            "🌟 <b>Gracias por su confianza</b> 🌟",
            footer_style
        ))
        elements.append(Spacer(1, 5))
        elements.append(Paragraph(
            "Este documento es una proforma y no constituye una factura.",
            footer_style
        ))
        elements.append(Paragraph(
            "Los precios están sujetos a cambios sin previo aviso.",
            footer_style
        ))
        
        return elements