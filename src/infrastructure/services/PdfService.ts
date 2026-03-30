import PDFDocument from 'pdfkit';
import { Presale } from '../../domain/presale/Presale';

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
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
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