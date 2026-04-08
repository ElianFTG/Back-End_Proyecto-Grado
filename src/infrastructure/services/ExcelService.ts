import ExcelJS from 'exceljs';
import { Presale } from '../../domain/presale/Presale';
import { PresaleReportFilters } from '../../domain/presale/PresaleFilter';

export class ExcelService {

    async generatePresaleReportExcel(
        presales: Presale[],
        filters: PresaleReportFilters
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Preventas';
        workbook.created = new Date();

        const summarySheet = workbook.addWorksheet('Resumen');
        this.buildSummarySheet(summarySheet, presales, filters);

        const detailSheet = workbook.addWorksheet('Detalle Preventas');
        this.buildDetailSheet(detailSheet, presales);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    private buildSummarySheet(
        sheet: ExcelJS.Worksheet,
        presales: Presale[],
        filters: PresaleReportFilters
    ): void {
        sheet.mergeCells('A1:H1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'REPORTE DE PREVENTAS';
        titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getRow(1).height = 30;

        sheet.mergeCells('A2:H2');
        const filterParts: string[] = [];
        if (filters.dateFrom) filterParts.push(`Desde: ${filters.dateFrom}`);
        if (filters.dateTo) filterParts.push(`Hasta: ${filters.dateTo}`);
        if (filterParts.length === 0) filterParts.push('Todas las fechas');
        const filterCell = sheet.getCell('A2');
        filterCell.value = filterParts.join('   |   ');
        filterCell.font = { italic: true, size: 9, color: { argb: 'FF555555' } };
        filterCell.alignment = { horizontal: 'center' };

        sheet.addRow([]);

        const headerRow = sheet.addRow(['Usuario', 'Rol', 'Total Preventas', 'Entregadas', 'Pendientes', 'Canceladas', 'No Entregadas', 'Total Bs.']);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFBDC3C7' } }
            };
        });
        sheet.getRow(4).height = 22;

        const groups = this.groupByUser(presales);
        let rowIndex = 5;

        for (const group of groups) {
            const delivered = group.presales.filter(p => p.status === 'entregado').length;
            const pending = group.presales.filter(p => p.status === 'pendiente' || p.status === 'asignado').length;
            const cancelled = group.presales.filter(p => p.status === 'cancelado').length;
            const notDelivered = group.presales.filter(p => p.status === 'no entregado' || p.status === 'parcial').length;
            const totalAmount = group.presales.reduce((sum, p) => sum + Number(p.total), 0);

            const row = sheet.addRow([
                group.userName,
                group.userRole,
                group.presales.length,
                delivered,
                pending,
                cancelled,
                notDelivered,
                totalAmount
            ]);

            const isEven = (rowIndex % 2) === 0;
            row.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: isEven ? 'FFF8F9FA' : 'FFFFFFFF' }
                };
                cell.alignment = { horizontal: colNumber >= 3 ? 'center' : 'left', vertical: 'middle' };
                if (colNumber === 8) {
                    cell.numFmt = '"Bs. "#,##0.00';
                    cell.font = { bold: true };
                }
            });

            rowIndex++;
        }

        const totalGeneral = presales.reduce((sum, p) => sum + Number(p.total), 0);
        const totalRow = sheet.addRow(['', 'TOTAL GENERAL', presales.length, '', '', '', '', totalGeneral]);
        totalRow.eachCell(cell => {
            cell.font = { bold: true, size: 11 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF0FB' } };
            cell.border = { top: { style: 'medium', color: { argb: 'FF2C3E50' } } };
        });
        const totalAmountCell = totalRow.getCell(8);
        totalAmountCell.numFmt = '"Bs. "#,##0.00';
        totalAmountCell.font = { bold: true, size: 11, color: { argb: 'FF27AE60' } };

        sheet.columns = [
            { key: 'A', width: 28 },
            { key: 'B', width: 16 },
            { key: 'C', width: 18 },
            { key: 'D', width: 14 },
            { key: 'E', width: 14 },
            { key: 'F', width: 14 },
            { key: 'G', width: 16 },
            { key: 'H', width: 16 },
        ];
    }

    private buildDetailSheet(sheet: ExcelJS.Worksheet, presales: Presale[]): void {
        // Cabecera
        const headers = [
            '# Preventa', 'Prevendedor', 'Transportista', 'Cliente', 'Negocio',
            'Fecha Creación', 'Fecha Entrega', 'Estado',
            'Producto', 'Cant. Pedida', 'Cant. Entregada', 'Tipo Precio',
            'Precio Unit.', 'Precio Final', 'Subtotal Pedido', 'Subtotal Entregado',
            'Total Preventa', 'Notas'
        ];

        const headerRow = sheet.addRow(headers);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFBDC3C7' } } };
        });
        sheet.getRow(1).height = 28;

        let rowIndex = 2;

        for (const presale of presales) {
            const details = presale.details ?? [];

            if (details.length === 0) {
                // Preventa sin detalles
                const row = sheet.addRow([
                    presale.id,
                    presale.presellerName ?? '—',
                    presale.distributorName ?? '—',
                    [presale.clientName, presale.clientLastName].filter(Boolean).join(' ') || '—',
                    presale.businessName ?? '—',
                    presale.createdAt ? new Date(presale.createdAt) : '',
                    presale.deliveryDate ? new Date(presale.deliveryDate) : '',
                    presale.status,
                    '—', '', '', '', '', '', '', '',
                    Number(presale.total),
                    presale.notes ?? ''
                ]);
                this.applyDetailRowStyle(row, rowIndex, presale.status);
                rowIndex++;
            } else {
                for (let i = 0; i < details.length; i++) {
                    const detail = details[i];
                    const row = sheet.addRow([
                        i === 0 ? presale.id : '',
                        i === 0 ? (presale.presellerName ?? '—') : '',
                        i === 0 ? (presale.distributorName ?? '—') : '',
                        i === 0 ? ([presale.clientName, presale.clientLastName].filter(Boolean).join(' ') || '—') : '',
                        i === 0 ? (presale.businessName ?? '—') : '',
                        i === 0 && presale.createdAt ? new Date(presale.createdAt) : '',
                        i === 0 && presale.deliveryDate ? new Date(presale.deliveryDate) : '',
                        i === 0 ? presale.status : '',
                        detail?.productName ?? `Producto #${detail?.productId}`,
                        detail?.quantityRequested,
                        detail?.quantityDelivered ?? '',
                        detail?.priceTypeName ?? '',
                        Number(detail?.unitPrice),
                        detail?.finalUnitPrice !== null ? Number(detail?.finalUnitPrice) : '',
                        Number(detail?.subtotalRequested),
                        detail?.subtotalDelivered !== null ? Number(detail?.subtotalDelivered) : '',
                        i === 0 ? Number(presale.total) : '',
                        i === 0 ? (presale.notes ?? '') : ''
                    ]);
                    this.applyDetailRowStyle(row, rowIndex, presale.status);
                    rowIndex++;
                }
            }
        }

        // Formato de fechas y moneda
        [6, 7].forEach(col => {
            sheet.getColumn(col).numFmt = 'dd/mm/yyyy';
        });
        [13, 14, 15, 16, 17].forEach(col => {
            sheet.getColumn(col).numFmt = '"Bs. "#,##0.00';
        });

        // Anchos de columna
        const colWidths = [12, 22, 22, 24, 24, 14, 14, 14, 30, 12, 14, 16, 14, 14, 16, 18, 14, 28];
        colWidths.forEach((width, idx) => {
            sheet.getColumn(idx + 1).width = width;
        });

        // Filtros automáticos
        sheet.autoFilter = { from: 'A1', to: `R1` };
    }

    private applyDetailRowStyle(row: ExcelJS.Row, rowIndex: number, status: string): void {
        const isEven = rowIndex % 2 === 0;
        const statusBg: Record<string, string> = {
            'entregado': 'FFE8F8F5',
            'cancelado': 'FFFDECEA',
            'no entregado': 'FFF5F5F5',
            'parcial': 'FFF5EEF8',
        };
        const bgColor = statusBg[status] ?? (isEven ? 'FFF8F9FA' : 'FFFFFFFF');

        row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            cell.font = { size: 9 };
            cell.alignment = { vertical: 'middle' };
            cell.border = {
                bottom: { style: 'hair', color: { argb: 'FFECF0F1' } }
            };
        });
        row.height = 16;
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
}