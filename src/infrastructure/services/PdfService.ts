import PDFDocument from 'pdfkit';
import { Presale } from '../../domain/presale/Presale';
import { PresaleReportFilters } from '../../domain/presale/PresaleFilter';

export class PdfService {

    generatePresalePdf(presale: Presale): PDFKit.PDFDocument {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        this.drawHeader(doc, presale);
        this.drawParties(doc, presale);
        this.drawDates(doc, presale);
        this.drawDivider(doc);
        this.drawProductsTable(doc, presale);
        this.drawTotals(doc, presale);
        if (presale.notes) this.drawNotes(doc, presale.notes);
        this.drawFooter(doc);

        doc.end();
        return doc;
    }

    generatePresaleReportPdf(presales: Presale[], filters: PresaleReportFilters): PDFKit.PDFDocument {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        this.drawReportTitle(doc, filters);

        if (presales.length === 0) {
            doc.font('Helvetica').fontSize(11).fillColor('#555555')
                .text('No se encontraron preventas con los filtros indicados.', { align: 'center' });
            doc.end();
            return doc;
        }

        const groups = this.groupByUser(presales);

        for (const group of groups) {
            this.drawUserGroupHeader(doc, group.userName, group.userRole);
            this.drawReportTable(doc, group.presales);
            doc.moveDown(1);
        }

        this.drawReportSummary(doc, presales);
        this.drawFooter(doc);

        doc.end();
        return doc;
    }

    private groupByUser(presales: Presale[]): { userName: string; userRole: string; presales: Presale[] }[] {
        const map = new Map<string, { userName: string; userRole: string; presales: Presale[] }>();

        for (const p of presales) {
            const key = p.presellerId !== null
                ? `preseller-${p.presellerId}`
                : p.distributorId !== null
                    ? `distributor-${p.distributorId}`
                    : 'unknown';

            const userName = p.presellerName ?? p.distributorName ?? 'Sin asignar';
            const userRole = p.presellerId !== null ? 'Prevendedor' : p.distributorId !== null ? 'Transportista' : '';

            if (!map.has(key)) {
                map.set(key, { userName, userRole, presales: [] });
            }
            map.get(key)!.presales.push(p);
        }

        return Array.from(map.values());
    }

    private drawReportTitle(doc: PDFKit.PDFDocument, filters: PresaleReportFilters): void {
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a1a2e')
            .text('REPORTE DE PREVENTAS', { align: 'center' });

        doc.moveDown(0.3);

        const parts: string[] = [];
        if (filters.dateFrom) parts.push(`Desde: ${filters.dateFrom}`);
        if (filters.dateTo) parts.push(`Hasta: ${filters.dateTo}`);
        if (!filters.dateFrom && !filters.dateTo) parts.push('Todas las fechas');

        doc.fontSize(9).font('Helvetica').fillColor('#555555')
            .text(parts.join('   |   '), { align: 'center' });

        doc.moveDown(0.8);
        this.drawDivider(doc);
        doc.moveDown(0.5);
    }

    private drawUserGroupHeader(doc: PDFKit.PDFDocument, userName: string, userRole: string): void {
        const y = doc.y;
        doc.rect(40, y, 515, 22).fill('#2c3e50');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
            .text(`${userRole ? userRole + ': ' : ''}${userName}`, 50, y + 5);
        doc.fillColor('#000000');
        doc.y = y + 22;
        doc.moveDown(0.3);
    }

    private drawReportTable(doc: PDFKit.PDFDocument, presales: Presale[]): void {
        const colX = { id: 40, client: 80, business: 195, date: 305, status: 375, total: 455 };
        const headerH = 18;
        const rowH = 16;

        // Cabecera de columnas
        let y = doc.y;
        doc.rect(40, y, 515, headerH).fill('#ecf0f1');
        doc.fillColor('#2c3e50').font('Helvetica-Bold').fontSize(8);
        doc.text('#', colX.id, y + 4)
            .text('CLIENTE', colX.client, y + 4, { width: 110 })
            .text('NEGOCIO', colX.business, y + 4, { width: 105 })
            .text('F. ENTREGA', colX.date, y + 4, { width: 65 })
            .text('ESTADO', colX.status, y + 4, { width: 75 })
            .text('TOTAL', colX.total, y + 4, { width: 60, align: 'right' });
        y += headerH;

        doc.font('Helvetica').fontSize(8).fillColor('#000000');

        for (let i = 0; i < presales.length; i++) {
            const p = presales[i];

            // Nueva página si es necesario
            if (y > 760) {
                doc.addPage();
                y = 40;
            }

            const bg = i % 2 === 0 ? '#ffffff' : '#f8f9fa';
            doc.rect(40, y, 515, rowH).fill(bg);
            doc.fillColor('#000000');

            const clientName = [p?.clientName, p?.clientLastName].filter(Boolean).join(' ') || '—';
            const businessName = p?.businessName ?? '—';
            const dateStr = p?.deliveryDate ? new Date(p.deliveryDate).toLocaleDateString('es-BO') : '—';
            const statusColors: Record<string, string> = {
                'pendiente': '#e67e22',
                'asignado': '#3498db',
                'entregado': '#27ae60',
                'parcial': '#8e44ad',
                'cancelado': '#e74c3c',
                'no entregado': '#95a5a6'
            };
            const statusColor = p?.status ? statusColors[p.status] ?? '#000000' : '#000000';

            doc.fillColor('#000000')
                .text(String(p?.id), colX.id, y + 3, { width: 35 })
                .text(clientName, colX.client, y + 3, { width: 110, ellipsis: true })
                .text(businessName, colX.business, y + 3, { width: 105, ellipsis: true })
                .text(dateStr, colX.date, y + 3, { width: 65 });

            doc.fillColor(statusColor)
                .text(p?.status ? p.status.toUpperCase() : '-', colX.status, y + 3, { width: 75 });

            doc.fillColor('#000000')
                .text(`Bs. ${Number(p?.total).toFixed(2)}`, colX.total, y + 3, { width: 60, align: 'right' });

            y += rowH;

            // Sub-tabla de detalles
            if (p?.details && p?.details.length && p?.details.length > 0) {
                for (const detail of p.details) {
                    if (y > 760) {
                        doc.addPage();
                        y = 40;
                    }
                    doc.rect(40, y, 515, 14).fill('#fdfefe');
                    doc.fillColor('#7f8c8d').font('Helvetica').fontSize(7);
                    const productName = detail.productName ?? `Producto #${detail.productId}`;
                    const qty = detail.quantityDelivered ?? detail.quantityRequested;
                    const price = detail.finalUnitPrice ?? detail.unitPrice;
                    const subtotal = detail.subtotalDelivered ?? detail.subtotalRequested;
                    const priceTypeName = detail.priceTypeName ?? '';

                    doc.text(`  ↳ ${productName}`, 55, y + 2, { width: 190 })
                        .text(priceTypeName, 250, y + 2, { width: 70 })
                        .text(`x${qty}`, 325, y + 2, { width: 40, align: 'center' })
                        .text(`Bs. ${price.toFixed(2)}`, 370, y + 2, { width: 70, align: 'right' })
                        .text(`Bs. ${Number(subtotal).toFixed(2)}`, 445, y + 2, { width: 70, align: 'right' });

                    doc.fillColor('#000000').font('Helvetica').fontSize(8);
                    y += 14;
                }
            }
        }

        doc.y = y;
        doc.moveDown(0.5);
    }

    private drawReportSummary(doc: PDFKit.PDFDocument, presales: Presale[]): void {
        this.drawDivider(doc);
        doc.moveDown(0.3);

        const totalGeneral = presales.reduce((sum, p) => sum + Number(p.total), 0);
        const totalPresales = presales.length;
        const byStatus: Record<string, number> = {};
        for (const p of presales) {
            byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
        }

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1a1a2e')
            .text('RESUMEN GENERAL', 40);
        doc.moveDown(0.3);

        doc.font('Helvetica').fontSize(9).fillColor('#000000')
            .text(`Total de preventas: ${totalPresales}`, 40);

        for (const [status, count] of Object.entries(byStatus)) {
            doc.text(`  • ${status}: ${count}`, 40);
        }

        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').fontSize(11)
            .text(`TOTAL GENERAL: Bs. ${totalGeneral.toFixed(2)}`, 40);

        doc.moveDown(1);
    }

    // ==================== MÉTODOS COMPARTIDOS ====================

    private drawHeader(doc: PDFKit.PDFDocument, presale: Presale): void {
        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('COMPROBANTE DE VENTA', { align: 'center' });

        doc
            .fontSize(11)
            .font('Helvetica')
            .text(`Preventa #${presale.id}`, { align: 'center' })
            .moveDown(1);
    }

    private drawParties(doc: PDFKit.PDFDocument, presale: Presale): void {
        const left = 50;
        const right = 300;
        const startY = doc.y;
        const lineH = 16;

        doc.font('Helvetica-Bold').fontSize(10).text('DATOS DEL CLIENTE', left, startY);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Negocio: ${presale.businessName ?? '—'}`, left, startY + lineH);
        doc.text(`Cliente: ${[presale.clientName, presale.clientLastName].filter(Boolean).join(' ') || '—'}`, left, startY + lineH * 2);
        doc.text(`Teléfono: ${presale.clientPhone ?? '—'}`, left, startY + lineH * 3);

        doc.font('Helvetica-Bold').fontSize(10).text('PERSONAL', right, startY);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Prevendedor: ${presale.presellerName ?? '—'}`, right, startY + lineH);
        doc.text(`Transportista: ${presale.distributorName ?? '—'}`, right, startY + lineH * 2);
        doc.text(`Sucursal: ${presale.branchName ?? '—'}`, right, startY + lineH * 3);

        doc.y = startY + lineH * 4;
        doc.moveDown(0.8);
    }

    private drawDates(doc: PDFKit.PDFDocument, presale: Presale): void {
        const formatDate = (d: Date | null | undefined) => {
            if (!d) return '—';
            return new Date(d).toLocaleDateString('es-BO', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        };

        doc.font('Helvetica').fontSize(10);
        doc.text(`Fecha de entrega: ${formatDate(presale.deliveryDate)}   |   Entregado: ${formatDate(presale.deliveredAt)}   |   Estado: ${presale.status.toUpperCase()}`);
        doc.moveDown(0.5);
    }

    private drawDivider(doc: PDFKit.PDFDocument): void {
        doc
            .moveTo(40, doc.y)
            .lineTo(555, doc.y)
            .strokeColor('#cccccc')
            .stroke()
            .moveDown(0.5);
    }

    private drawProductsTable(doc: PDFKit.PDFDocument, presale: Presale): void {
        const details = (presale.details ?? []).filter(d => d.state);

        const cols = { product: 50, qty: 280, unitPrice: 350, subtotal: 450 };
        const rowH = 20;
        let y = doc.y;

        doc.font('Helvetica-Bold').fontSize(9);
        doc.rect(50, y, 495, rowH).fill('#2c3e50');
        doc
            .fillColor('#ffffff')
            .text('PRODUCTO', cols.product + 4, y + 5)
            .text('CANT.', cols.qty, y + 5, { width: 60, align: 'right' })
            .text('P. UNIT.', cols.unitPrice, y + 5, { width: 80, align: 'right' })
            .text('SUBTOTAL', cols.subtotal, y + 5, { width: 80, align: 'right' });

        doc.fillColor('#000000');
        y += rowH;

        doc.font('Helvetica').fontSize(9);
        details.forEach((detail, i) => {
            const bg = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
            doc.rect(50, y, 495, rowH).fill(bg);
            doc.fillColor('#000000');

            const productName = detail.productName ?? `Producto #${detail.productId}`;
            const qty = detail.quantityDelivered ?? detail.quantityRequested;
            const unitPrice = detail.finalUnitPrice ?? detail.unitPrice;
            const subtotal = detail.subtotalDelivered ?? detail.subtotalRequested;

            doc
                .text(productName, cols.product + 4, y + 5, { width: 220 })
                .text(String(qty), cols.qty, y + 5, { width: 60, align: 'right' })
                .text(`Bs. ${unitPrice.toFixed(2)}`, cols.unitPrice, y + 5, { width: 80, align: 'right' })
                .text(`Bs. ${Number(subtotal).toFixed(2)}`, cols.subtotal, y + 5, { width: 80, align: 'right' });

            y += rowH;

            if (y > 720) {
                doc.addPage();
                y = 50;
            }
        });

        doc.y = y;
        doc.moveDown(0.5);
    }

    private drawTotals(doc: PDFKit.PDFDocument, presale: Presale): void {
        this.drawDivider(doc);

        const xLabel = 380;
        const xValue = 460;

        doc.font('Helvetica').fontSize(10);
        doc.text('Subtotal:', xLabel, doc.y, { continued: false });
        doc.text(`Bs. ${Number(presale.subtotal).toFixed(2)}`, xValue, doc.y - doc.currentLineHeight(), { align: 'right', width: 85 });

        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('TOTAL:', xLabel, doc.y, { continued: false });
        doc.text(`Bs. ${Number(presale.total).toFixed(2)}`, xValue, doc.y - doc.currentLineHeight(), { align: 'right', width: 85 });

        doc.moveDown(1);
    }

    private drawNotes(doc: PDFKit.PDFDocument, notes: string): void {
        doc.font('Helvetica-Bold').fontSize(9).text('Notas:');
        doc.font('Helvetica').fontSize(9).text(notes);
        doc.moveDown(1);
    }

    private drawFooter(doc: PDFKit.PDFDocument): void {
        this.drawDivider(doc);
        doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#888888')
            .text('Documento generado automáticamente.', { align: 'center' });
    }
}