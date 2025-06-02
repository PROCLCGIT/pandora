# backend/proformas/pdf_templates/classic_template.py

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import TableStyle, Paragraph, Spacer, Table
from reportlab.graphics.shapes import Drawing, Rect, Polygon
from reportlab.graphics import renderPDF
from .base_template import BasePDFTemplate


class PremiumTemplate(BasePDFTemplate):
    """
    Template premium moderno inspirado en diseños contemporáneos
    Color principal: Turquesa/Verde azulado
    """
    
    def get_template_name(self):
        return "Premium"
    
    def get_template_description(self):
        return "Diseño moderno y elegante con elementos geométricos y color turquesa"
    
    def _create_custom_styles(self):
        """Define los estilos personalizados del template premium"""
        # Color principal turquesa
        primary_color = '#4FD1C7'
        secondary_color = '#2DD4BF'
        dark_color = '#0F766E'
        text_dark = '#1F2937'
        text_light = '#6B7280'
        
        # Estilo para el título PROFORMA
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=32,
            textColor=colors.white,
            alignment=TA_CENTER,
            spaceAfter=0,
            fontName='Helvetica-Bold',
            leftIndent=0,
            rightIndent=0,
        ))
        
        # Estilo para subtítulos con color turquesa
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor(dark_color),
            spaceAfter=15,
            spaceBefore=15,
            fontName='Helvetica-Bold',
        ))
        
        # Estilo para información de la empresa
        self.styles.add(ParagraphStyle(
            name='CompanyInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_RIGHT,
            textColor=colors.HexColor(text_dark),
            fontName='Helvetica',
        ))
        
        # Estilo para el número de proforma
        self.styles.add(ParagraphStyle(
            name='ProformaNumber',
            parent=self.styles['Normal'],
            fontSize=18,
            alignment=TA_LEFT,
            textColor=colors.HexColor(dark_color),
            fontName='Helvetica-Bold',
        ))
        
        # Estilo para cajas de información
        self.styles.add(ParagraphStyle(
            name='InfoBoxTitle',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
        ))
        
        # Estilo para total destacado
        self.styles.add(ParagraphStyle(
            name='GrandTotal',
            parent=self.styles['Normal'],
            fontSize=24,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
        ))
    
    def _create_header_elements(self):
        """Crea el header premium con elementos geométricos"""
        elements = []
        
        # Crear header con banda turquesa y elementos geométricos
        header_data = [['']]
        header_table = Table(header_data, colWidths=[550], rowHeights=[80])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#4FD1C7')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(header_table)
        
        # Título PROFORMA sobre la banda
        title_data = [['PROFORMA']]
        title_table = Table(title_data, colWidths=[550], rowHeights=[60])
        title_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#4FD1C7')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 32),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
        ]))
        
        # Superponer título sobre header
        elements[-1] = title_table  # Reemplazar la tabla anterior
        elements.append(Spacer(1, 20))
        
        # Información de la empresa en la esquina superior (simular overlay)
        empresa = self.proforma.empresa
        company_info = f"""
        <b>{empresa.nombre or 'Empresa'}</b><br/>
        {empresa.ruc or 'N/A'}<br/>
        {empresa.direccion or 'Dirección no especificada'}<br/>
        Tel: {getattr(empresa, 'telefono', 'N/A') or 'N/A'} | Email: {getattr(empresa, 'correo', 'N/A') or 'N/A'}
        """
        
        # Crear tabla para información de empresa
        company_data = [['', company_info]]
        company_table = Table(company_data, colWidths=[350, 200])
        company_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTSIZE', (1, 0), (1, -1), 10),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1F2937')),
        ]))
        
        elements.append(company_table)
        elements.append(Spacer(1, 30))
        
        return elements
    
    def _create_proforma_info_section(self):
        """Crea la sección de información de la proforma con estilo premium"""
        elements = []
        
        # Total destacado en la parte superior
        total_data = [[f'Total Due: USD $ {self.proforma.total:,.2f}']]
        total_table = Table(total_data, colWidths=[550])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 20),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#4FD1C7')),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        
        elements.append(total_table)
        elements.append(Spacer(1, 20))
        
        # Crear sección con dos cajas: INVOICE DETAILS e INVOICE TO
        invoice_details = f"""
        <b>INVOICE NO:</b> {self.proforma.numero}<br/>
        <b>INVOICE DATE:</b> {self.proforma.fecha_emision.strftime('%d %b, %Y')}<br/>
        <b>ACCOUNT NO:</b> {getattr(self.proforma, 'numero_cuenta', 'N/A')}
        """
        
        cliente = self.proforma.cliente
        invoice_to = f"""
        <b>{cliente.nombre or 'Cliente'}</b><br/>
        {cliente.ruc or 'N/A'}<br/>
        {cliente.direccion or 'N/A'}<br/>
        {cliente.telefono or 'N/A'}
        """
        
        # Crear tabla con las dos secciones
        info_data = [
            # Headers
            [
                Paragraph('<b>INVOICE DETAILS</b>', self.styles['InfoBoxTitle']),
                Paragraph('<b>INVOICE TO</b>', self.styles['InfoBoxTitle'])
            ],
            # Content
            [invoice_details, invoice_to]
        ]
        
        info_table = Table(info_data, colWidths=[275, 275])
        info_table.setStyle(TableStyle([
            # Headers
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4FD1C7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Content
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#F8FAFC')),
            ('VALIGN', (0, 1), (-1, 1), 'TOP'),
            ('FONTSIZE', (0, 1), (-1, 1), 10),
            ('TOPPADDING', (0, 1), (-1, 1), 15),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 15),
            ('LEFTPADDING', (0, 1), (-1, 1), 15),
            ('RIGHTPADDING', (0, 1), (-1, 1), 15),
            
            # Borders
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 30))
        
        return elements
    
    def _get_items_table_style(self):
        """Estilo premium para la tabla de items"""
        return TableStyle([
            # Encabezado
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4FD1C7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 15),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 15),
            
            # Contenido
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # S NO.
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),    # ITEM DESCRIPTION
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),  # QTY
            ('ALIGN', (3, 1), (3, -1), 'RIGHT'),   # UNIT PRICE
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'),   # PRICE
            
            # Bordes y colores
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
        ])
    
    def _create_items_table(self):
        """Sobrescribe para usar headers estilo premium"""
        headers = ['S NO.', 'ITEM DESCRIPTION', 'QTY', 'UNIT PRICE', 'PRICE']
        data = [headers]
        
        for idx, item in enumerate(self.proforma.items.all(), 1):
            # Descripción más detallada
            descripcion = f"""
            <b>{item.descripcion or 'Sin descripción'}</b><br/>
            <font size="8" color="#6B7280">
            {getattr(item, 'detalle_adicional', 'Descripción detallada del producto o servicio')}
            </font>
            """
            
            data.append([
                f"{idx:02d}",  # Formato con ceros a la izquierda
                Paragraph(descripcion, self.styles['Normal']),
                f"{item.cantidad:02.0f}",  # Formato con ceros
                f"${item.precio_unitario:,.2f}",
                f"${item.total:,.2f}"
            ])
        
        col_widths = [50, 250, 50, 100, 100]
        table = Table(data, colWidths=col_widths)
        table.setStyle(self._get_items_table_style())
        return table
    
    def _create_totals_section(self):
        """Crea la sección de totales estilo premium"""
        elements = []
        
        # Subtotales en tabla normal
        subtotals_data = [
            ['SUB TOTAL', f'${self.proforma.subtotal:,.2f}'],
            [f'Tax VAT {self.proforma.porcentaje_impuesto}%', f'${self.proforma.impuesto:,.2f}'],
        ]
        
        # Agregar descuento si existe
        if hasattr(self.proforma, 'descuento') and self.proforma.descuento:
            subtotals_data.append(['DISCOUNT 5%', f'-${self.proforma.descuento:,.2f}'])
        
        subtotals_table = Table(subtotals_data, colWidths=[200, 100])
        subtotals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        
        # Alinear subtotales a la derecha
        subtotals_container = Table([['', subtotals_table]], colWidths=[250, 300])
        elements.append(subtotals_container)
        elements.append(Spacer(1, 15))
        
        # Grand Total en caja destacada
        grand_total_data = [[f'GRAND TOTAL    ${self.proforma.total:,.2f}']]
        grand_total_table = Table(grand_total_data, colWidths=[300])
        grand_total_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#4FD1C7')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 18),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        # Alinear grand total a la derecha
        total_container = Table([['', grand_total_table]], colWidths=[250, 300])
        elements.append(total_container)
        elements.append(Spacer(1, 30))
        
        return elements
    
    def _get_client_table_style(self):
        """No se usa en este template, la info va en las cajas superiores"""
        return TableStyle([])
    
    def _get_totals_table_style(self):
        """No se usa, se maneja en _create_totals_section"""
        return TableStyle([])
    
    def _create_footer_elements(self):
        """Crea el footer premium con información adicional"""
        elements = []
        
        # Información bancaria y condiciones en dos columnas
        footer_data = [
            [
                Paragraph('<b>Bank Information</b><br/>Bank Name: Banco Pichincha<br/>Swift Code: PICHECEG<br/>Account No: 09 200 100 400', 
                         self.styles['Normal']),
                Paragraph('<b>Payment Method</b><br/>PayPal, VISA, Master Card, American Express', 
                         self.styles['Normal'])
            ],
            [
                Paragraph('<b>Terms and Conditions</b><br/>Los precios incluyen implementación básica. Cualquier personalización adicional será cotizada por separado.<br/>La capacitación se realizará en las instalaciones del cliente.', 
                         self.styles['Normal']),
                ''
            ]
        ]
        
        footer_table = Table(footer_data, colWidths=[275, 275])
        footer_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#6B7280')),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('SPAN', (0, 1), (1, 1)),  # Terms span both columns
        ]))
        
        elements.append(footer_table)
        elements.append(Spacer(1, 20))
        
        # Thank you message
        thanks_data = [['Thank you for your Business.']]
        thanks_table = Table(thanks_data, colWidths=[550])
        thanks_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#4FD1C7')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        elements.append(thanks_table)
        
        return elements
    
    def generate(self):
        """Genera el PDF usando el template premium"""
        from reportlab.platypus import SimpleDocTemplate
        
        # Configurar documento
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=(595.27, 841.89),  # A4
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=50,
            title=f"Proforma {self.proforma.numero}"
        )
        
        # Contenido del documento
        elements = []
        
        # Header con banda turquesa y título
        elements.extend(self._create_header_elements())
        
        # Sección de información de la proforma
        elements.extend(self._create_proforma_info_section())
        
        # Tabla de productos
        elements.append(self._create_items_table())
        elements.append(Spacer(1, 20))
        
        # Totales
        elements.extend(self._create_totals_section())
        
        # Footer
        elements.extend(self._create_footer_elements())
        
        # Generar PDF
        doc.build(elements)
        
        # Retornar el buffer
        self.buffer.seek(0)
        return self.buffer