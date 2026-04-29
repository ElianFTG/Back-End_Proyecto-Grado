import ExcelJS from 'exceljs';
import { Presale } from '../../domain/presale/Presale';
import { PresaleReportFilters } from '../../domain/presale/PresaleFilter';

const COLORS = {
    darkNavy:    'FF1A1A2E',
    navy:        'FF2C3E50',
    navyMid:     'FF34495E',
    blue:        'FF2980B9',
    green:       'FF27AE60',
    greenLight:  'FFE8F8F5',
    orange:      'FFE67E22',
    orangeLight: 'FFFEF9E7',
    red:         'FFE74C3C',
    redLight:    'FFFDECEA',
    purple:      'FF8E44AD',
    purpleLight: 'FFF5EEF8',
    gray:        'FF95A5A6',
    grayLight:   'FFF2F3F4',
    white:       'FFFFFFFF',
    rowEven:     'FFF8F9FA',
    rowOdd:      'FFFFFFFF',
    headerText:  'FFFFFFFF',
    gold:        'FFF39C12',
    teal:        'FF16A085',
    tealLight:   'FFE8F8F5',
};

const STATUS_COLORS: Record<string, { bg: string; font: string }> = {
    'entregado':    { bg: COLORS.greenLight,  font: COLORS.green  },
    'cancelado':    { bg: COLORS.redLight,    font: COLORS.red    },
    'no entregado': { bg: COLORS.grayLight,   font: COLORS.gray   },
    'parcial':      { bg: COLORS.purpleLight, font: COLORS.purple },
    'pendiente':    { bg: COLORS.orangeLight, font: COLORS.orange },
    'asignado':     { bg: 'FFE8F4FD',         font: COLORS.blue   },
};

export class ExcelService {

    async generatePresaleReportExcel(
        presales: Presale[],
        filters: PresaleReportFilters
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Preventas';
        workbook.created = new Date();

        this.buildDashboardSheet(workbook.addWorksheet('📊 Dashboard'), presales, filters);
        this.buildSummarySheet(workbook.addWorksheet('👥 Resumen por Usuario'), presales, filters);
        this.buildDetailSheet(workbook.addWorksheet('📋 Detalle Preventas'), presales);
        this.buildProductSheet(workbook.addWorksheet('📦 Análisis por Producto'), presales);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    private buildDashboardSheet(
        sheet: ExcelJS.Worksheet,
        presales: Presale[],
        filters: PresaleReportFilters
    ): void {
        sheet.getColumn('A').width = 32;
        sheet.getColumn('B').width = 22;
        sheet.getColumn('C').width = 22;
        sheet.getColumn('D').width = 22;
        sheet.getColumn('E').width = 22;

        const filterParts: string[] = [];
        if (filters.dateFrom) filterParts.push(`Desde: ${filters.dateFrom}`);
        if (filters.dateTo)   filterParts.push(`Hasta: ${filters.dateTo}`);
        if (!filterParts.length) filterParts.push('Todas las fechas');

        this.mergeFill(sheet, 'A1:E1', 'REPORTE DE PREVENTAS — DASHBOARD', 16, COLORS.darkNavy, COLORS.white, 36, 'center');
        this.mergeFill(sheet, 'A2:E2', filterParts.join('   |   '), 9, COLORS.grayLight, COLORS.navyMid, 18, 'center', true);
        this.mergeFill(sheet, 'A3:E3', `Generado: ${new Date().toLocaleString('es-BO')}`, 8, COLORS.white, COLORS.gray, 14, 'center', true);

        sheet.addRow([]);

        const totalAmount    = presales.reduce((s, p) => s + Number(p.total), 0);
        const delivered      = presales.filter(p => p.status === 'entregado').length;
        const partial        = presales.filter(p => p.status === 'parcial').length;
        const cancelled      = presales.filter(p => p.status === 'cancelado').length;
        const notDelivered   = presales.filter(p => p.status === 'no entregado').length;
        const pending        = presales.filter(p => p.status === 'pendiente' || p.status === 'asignado').length;
        const deliveredAmt   = presales.filter(p => p.status === 'entregado' || p.status === 'parcial').reduce((s, p) => s + Number(p.total), 0);
        const cancelledAmt   = presales.filter(p => p.status === 'cancelado').reduce((s, p) => s + Number(p.total), 0);
        const completionRate = presales.length > 0 ? ((delivered + partial) / presales.length) : 0;

        const kpiData = [
            ['INDICADOR',            'VALOR',            null, 'INDICADOR',           'VALOR'],
            ['Total de Preventas',   presales.length,    null, 'Entregadas',           delivered],
            ['Monto Total',          totalAmount,        null, 'Parcialmente entregadas', partial],
            ['Monto Cobrado',        deliveredAmt,       null, 'Pendientes / Asignadas', pending],
            ['Monto Cancelado',      cancelledAmt,       null, 'Canceladas',           cancelled],
            ['Tasa de Completitud',  completionRate,     null, 'No Entregadas',        notDelivered],
        ];

        for (let i = 0; i < kpiData.length; i++) {
            const rowData = kpiData[i];
            const r = sheet.addRow([rowData[0], rowData[1], '', rowData[3], rowData[4]]);
            r.height = i === 0 ? 22 : 20;

            if (i === 0) {
                [1, 2, 4, 5].forEach(col => {
                    const cell = r.getCell(col);
                    cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
            } else {
                const isEven = i % 2 === 0;
                const bg = isEven ? COLORS.rowEven : COLORS.rowOdd;

                const labelStyle = (cell: ExcelJS.Cell) => {
                    cell.font = { size: 10 };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                    cell.alignment = { vertical: 'middle' };
                };

                const valueStyle = (cell: ExcelJS.Cell, isAmount: boolean, isRate: boolean) => {
                    cell.font = { bold: true, size: 11, color: { argb: COLORS.navy } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    if (isAmount) cell.numFmt = '"Bs. "#,##0.00';
                    if (isRate)   cell.numFmt = '0.0%';
                };

                labelStyle(r.getCell(1));
                valueStyle(r.getCell(2), i === 3 || i === 4, i === 5);
                labelStyle(r.getCell(4));
                valueStyle(r.getCell(5), false, false);
            }

            const sep = r.getCell(3);
            sep.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.white } };
        }

        sheet.addRow([]);

        this.mergeFill(sheet, `A${sheet.rowCount + 1}:E${sheet.rowCount + 1}`, 'DISTRIBUCIÓN POR ESTADO', 10, COLORS.navyMid, COLORS.white, 22, 'center');

        const statusHeader = sheet.addRow(['Estado', 'Cantidad', '% del Total', 'Monto Total', '% del Monto']);
        statusHeader.height = 20;
        statusHeader.eachCell(cell => {
            cell.font = { bold: true, color: { argb: COLORS.white }, size: 9 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMid } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const statusList: Array<{ label: string; key: string }> = [
            { label: 'Entregado',         key: 'entregado'    },
            { label: 'Parcial',           key: 'parcial'      },
            { label: 'Pendiente/Asignado',key: 'pendiente'    },
            { label: 'Cancelado',         key: 'cancelado'    },
            { label: 'No Entregado',      key: 'no entregado' },
        ];

        for (const s of statusList) {
            const group = presales.filter(p =>
                s.key === 'pendiente'
                    ? p.status === 'pendiente' || p.status === 'asignado'
                    : p.status === s.key
            );
            const count  = group.length;
            const pct    = presales.length > 0 ? count / presales.length : 0;
            const amount = group.reduce((acc, p) => acc + Number(p.total), 0);
            const pctAmt = totalAmount > 0 ? amount / totalAmount : 0;

            const sc = STATUS_COLORS[s.key] ?? { bg: COLORS.grayLight, font: COLORS.gray };
            const r = sheet.addRow([s.label, count, pct, amount, pctAmt]);
            r.height = 18;
            r.eachCell((cell, col) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc.bg } };
                cell.font = { size: 9, color: { argb: sc.font }, bold: col === 1 };
                cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
            });
            r.getCell(3).numFmt = '0.0%';
            r.getCell(4).numFmt = '"Bs. "#,##0.00';
            r.getCell(5).numFmt = '0.0%';
        }

        sheet.addRow([]);

        this.mergeFill(sheet, `A${sheet.rowCount + 1}:E${sheet.rowCount + 1}`, 'TOP 5 PREVENDEDORES POR MONTO', 10, COLORS.navyMid, COLORS.white, 22, 'center');

        const topHeader = sheet.addRow(['Prevendedor', 'Preventas', 'Entregadas', 'Monto Total', 'Tasa Éxito']);
        topHeader.height = 20;
        topHeader.eachCell(cell => {
            cell.font = { bold: true, color: { argb: COLORS.white }, size: 9 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.teal } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const byPreseller = this.groupByUser(presales);
        const topFive = byPreseller
            .map(g => ({
                name:      g.userName,
                role:      g.userRole,
                count:     g.presales.length,
                delivered: g.presales.filter(p => p.status === 'entregado' || p.status === 'parcial').length,
                amount:    g.presales.reduce((s, p) => s + Number(p.total), 0),
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        topFive.forEach((entry, idx) => {
            const rate = entry.count > 0 ? entry.delivered / entry.count : 0;
            const r = sheet.addRow([entry.name, entry.count, entry.delivered, entry.amount, rate]);
            r.height = 18;
            const bg = idx % 2 === 0 ? COLORS.tealLight : COLORS.white;
            r.eachCell((cell, col) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                cell.font = { size: 9 };
                cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
            });
            r.getCell(4).numFmt = '"Bs. "#,##0.00';
            r.getCell(4).font = { bold: true, size: 9 };
            r.getCell(5).numFmt = '0.0%';
        });
    }

    private buildSummarySheet(
        sheet: ExcelJS.Worksheet,
        presales: Presale[],
        filters: PresaleReportFilters
    ): void {
        const filterParts: string[] = [];
        if (filters.dateFrom) filterParts.push(`Desde: ${filters.dateFrom}`);
        if (filters.dateTo)   filterParts.push(`Hasta: ${filters.dateTo}`);
        if (!filterParts.length) filterParts.push('Todas las fechas');

        this.mergeFill(sheet, 'A1:J1', 'RESUMEN POR USUARIO', 14, COLORS.darkNavy, COLORS.white, 32, 'center');
        this.mergeFill(sheet, 'A2:J2', filterParts.join('   |   '), 9, COLORS.grayLight, COLORS.navyMid, 16, 'center', true);
        sheet.addRow([]);

        const headers = [
            'Usuario', 'Rol',
            'Total', 'Entregadas', 'Parciales', 'Pendientes', 'Canceladas', 'No Entregadas',
            'Tasa de Éxito', 'Monto Total'
        ];
        const hr = sheet.addRow(headers);
        hr.height = 24;
        hr.eachCell(cell => {
            cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = { bottom: { style: 'medium', color: { argb: COLORS.navyMid } } };
        });

        const groups = this.groupByUser(presales);
        let rowIdx = 5;

        for (const g of groups) {
            const delivered    = g.presales.filter(p => p.status === 'entregado').length;
            const partial      = g.presales.filter(p => p.status === 'parcial').length;
            const pending      = g.presales.filter(p => p.status === 'pendiente' || p.status === 'asignado').length;
            const cancelled    = g.presales.filter(p => p.status === 'cancelado').length;
            const notDelivered = g.presales.filter(p => p.status === 'no entregado').length;
            const amount       = g.presales.reduce((s, p) => s + Number(p.total), 0);
            const successRate  = g.presales.length > 0 ? (delivered + partial) / g.presales.length : 0;

            const r = sheet.addRow([
                g.userName, g.userRole,
                g.presales.length, delivered, partial, pending, cancelled, notDelivered,
                successRate, amount,
            ]);
            r.height = 20;

            const isEven = rowIdx % 2 === 0;
            r.eachCell((cell, col) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? COLORS.rowEven : COLORS.rowOdd } };
                cell.alignment = { horizontal: col <= 2 ? 'left' : 'center', vertical: 'middle' };
                cell.font = { size: 10 };
                cell.border = { bottom: { style: 'hair', color: { argb: 'FFECF0F1' } } };
            });
            r.getCell(9).numFmt  = '0.0%';
            r.getCell(10).numFmt = '"Bs. "#,##0.00';
            r.getCell(10).font   = { bold: true, size: 10 };

            if (successRate >= 0.8)       r.getCell(9).font = { bold: true, color: { argb: COLORS.green } };
            else if (successRate >= 0.5)  r.getCell(9).font = { bold: true, color: { argb: COLORS.orange } };
            else                          r.getCell(9).font = { bold: true, color: { argb: COLORS.red } };

            rowIdx++;
        }

        const totalAmount = presales.reduce((s, p) => s + Number(p.total), 0);
        const tr = sheet.addRow([
            'TOTAL GENERAL', '',
            presales.length,
            presales.filter(p => p.status === 'entregado').length,
            presales.filter(p => p.status === 'parcial').length,
            presales.filter(p => p.status === 'pendiente' || p.status === 'asignado').length,
            presales.filter(p => p.status === 'cancelado').length,
            presales.filter(p => p.status === 'no entregado').length,
            presales.length > 0
                ? (presales.filter(p => p.status === 'entregado' || p.status === 'parcial').length / presales.length)
                : 0,
            totalAmount,
        ]);
        tr.height = 24;
        tr.eachCell(cell => {
            cell.font = { bold: true, size: 11, color: { argb: COLORS.white } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.darkNavy } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = { top: { style: 'medium', color: { argb: COLORS.white } } };
        });
        tr.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        tr.getCell(9).numFmt  = '0.0%';
        tr.getCell(10).numFmt = '"Bs. "#,##0.00';

        sheet.columns = [
            { width: 30 }, { width: 16 }, { width: 10 }, { width: 14 },
            { width: 12 }, { width: 14 }, { width: 14 }, { width: 16 },
            { width: 14 }, { width: 16 },
        ];
    }

    private buildDetailSheet(sheet: ExcelJS.Worksheet, presales: Presale[]): void {
        const headers = [
            '#', 'Prevendedor', 'Transportista', 'Cliente', 'Teléfono', 'Negocio', 'Sucursal',
            'F. Creación', 'F. Entrega', 'F. Entregado', 'Estado',
            'Producto', 'Cód. Barras', 'Cant. Pedida', 'Cant. Entregada', 'Diferencia',
            'Tipo Precio', 'P. Unitario', 'P. Final', 'Subtotal Pedido', 'Subtotal Entregado',
            'Total Preventa', 'Notas Pedido', 'Notas Entrega',
        ];

        const hr = sheet.addRow(headers);
        hr.height = 30;
        hr.eachCell(cell => {
            cell.font = { bold: true, color: { argb: COLORS.white }, size: 9, name: 'Arial' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.darkNavy } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = { bottom: { style: 'medium', color: { argb: COLORS.blue } } };
        });

        let rowIdx = 2;

        for (const presale of presales) {
            const details = presale.details ?? [];
            const clientFull = [presale.clientName, presale.clientLastName].filter(Boolean).join(' ') || '—';
            const sc = STATUS_COLORS[presale.status] ?? { bg: COLORS.grayLight, font: COLORS.gray };

            if (details.length === 0) {
                const r = sheet.addRow([
                    presale.id,
                    presale.presellerName   ?? '—',
                    presale.distributorName ?? '—',
                    clientFull,
                    presale.clientPhone     ?? '—',
                    presale.businessName    ?? '—',
                    presale.branchName      ?? '—',
                    presale.createdAt  ? new Date(presale.createdAt)  : '',
                    presale.deliveryDate    ? new Date(presale.deliveryDate)  : '',
                    presale.deliveredAt     ? new Date(presale.deliveredAt)   : '',
                    presale.status,
                    '—', '', '', '', '', '', '', '', '', '',
                    Number(presale.total),
                    presale.notes         ?? '',
                    presale.deliveryNotes ?? '',
                ]);
                this.applyDetailRowStyle(r, rowIdx, presale.status, sc, true);
                rowIdx++;
                continue;
            }

            for (let i = 0; i < details.length; i++) {
                const d = details[i];
                const diff = (d.quantityDelivered ?? 0) - d.quantityRequested;

                const r = sheet.addRow([
                    i === 0 ? presale.id : '',
                    i === 0 ? (presale.presellerName   ?? '—') : '',
                    i === 0 ? (presale.distributorName ?? '—') : '',
                    i === 0 ? clientFull : '',
                    i === 0 ? (presale.clientPhone     ?? '—') : '',
                    i === 0 ? (presale.businessName    ?? '—') : '',
                    i === 0 ? (presale.branchName      ?? '—') : '',
                    i === 0 && presale.createdAt  ? new Date(presale.createdAt)  : '',
                    i === 0 && presale.deliveryDate    ? new Date(presale.deliveryDate)  : '',
                    i === 0 && presale.deliveredAt     ? new Date(presale.deliveredAt)   : '',
                    i === 0 ? presale.status : '',
                    d.productName ?? `Producto #${d.productId}`,
                    d.productBarcode ?? '',
                    d.quantityRequested,
                    d.quantityDelivered ?? '',
                    d.quantityDelivered !== null ? diff : '',
                    d.priceTypeName ?? '',
                    Number(d.unitPrice),
                    d.finalUnitPrice !== null ? Number(d.finalUnitPrice) : '',
                    Number(d.subtotalRequested),
                    d.subtotalDelivered !== null ? Number(d.subtotalDelivered) : '',
                    i === 0 ? Number(presale.total) : '',
                    i === 0 ? (presale.notes         ?? '') : '',
                    i === 0 ? (presale.deliveryNotes ?? '') : '',
                ]);

                this.applyDetailRowStyle(r, rowIdx, presale.status, sc, i === 0);

                const diffCell = r.getCell(16);
                if (d.quantityDelivered !== null) {
                    if (diff < 0) {
                        diffCell.font = { size: 9, color: { argb: COLORS.red },    bold: true };
                    } else if (diff > 0) {
                        diffCell.font = { size: 9, color: { argb: COLORS.green },  bold: true };
                    }
                }

                rowIdx++;
            }
        }

        [8, 9, 10].forEach(col => {
            sheet.getColumn(col).numFmt = 'dd/mm/yyyy hh:mm';
        });
        [18, 19, 20, 21, 22].forEach(col => {
            sheet.getColumn(col).numFmt = '"Bs. "#,##0.00';
        });

        const colWidths = [8, 22, 22, 24, 14, 24, 18, 18, 14, 18, 14, 30, 14, 12, 14, 12, 16, 14, 14, 18, 18, 16, 28, 28];
        colWidths.forEach((w, i) => { sheet.getColumn(i + 1).width = w; });

        sheet.autoFilter = { from: 'A1', to: 'X1' };
        sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
    }

    private buildProductSheet(sheet: ExcelJS.Worksheet, presales: Presale[]): void {
        this.mergeFill(sheet, 'A1:H1', 'ANÁLISIS POR PRODUCTO', 13, COLORS.darkNavy, COLORS.white, 28, 'center');
        sheet.addRow([]);

        const productMap = new Map<number, {
            name: string;
            barcode: string;
            totalRequested: number;
            totalDelivered: number;
            totalRevenueRequested: number;
            totalRevenueDelivered: number;
            presaleCount: number;
            priceTypeCounts: Record<string, number>;
        }>();

        for (const presale of presales) {
            for (const d of presale.details ?? []) {
                if (!productMap.has(d.productId)) {
                    productMap.set(d.productId, {
                        name: d.productName ?? `Producto #${d.productId}`,
                        barcode: d.productBarcode ?? '—',
                        totalRequested: 0,
                        totalDelivered: 0,
                        totalRevenueRequested: 0,
                        totalRevenueDelivered: 0,
                        presaleCount: 0,
                        priceTypeCounts: {},
                    });
                }
                const entry = productMap.get(d.productId)!;
                entry.totalRequested       += d.quantityRequested;
                entry.totalDelivered       += d.quantityDelivered ?? 0;
                entry.totalRevenueRequested += Number(d.subtotalRequested);
                entry.totalRevenueDelivered += Number(d.subtotalDelivered ?? 0);
                entry.presaleCount         += 1;
                if (d.priceTypeName) {
                    entry.priceTypeCounts[d.priceTypeName] = (entry.priceTypeCounts[d.priceTypeName] ?? 0) + 1;
                }
            }
        }

        const headers = [
            'Producto', 'Cód. Barras',
            'Veces Pedido', 'Cant. Total Pedida', 'Cant. Total Entregada', 'Diferencia',
            'Ingresos Pedidos', 'Ingresos Entregados',
        ];
        const hr = sheet.addRow(headers);
        hr.height = 24;
        hr.eachCell(cell => {
            cell.font = { bold: true, color: { argb: COLORS.white }, size: 9, name: 'Arial' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = { bottom: { style: 'medium', color: { argb: COLORS.navyMid } } };
        });

        const sortedProducts = Array.from(productMap.values())
            .sort((a, b) => b.totalRevenueRequested - a.totalRevenueRequested);

        sortedProducts.forEach((p, idx) => {
            const diff = p.totalDelivered - p.totalRequested;
            const r = sheet.addRow([
                p.name,
                p.barcode,
                p.presaleCount,
                p.totalRequested,
                p.totalDelivered,
                diff,
                p.totalRevenueRequested,
                p.totalRevenueDelivered,
            ]);
            r.height = 18;
            const bg = idx % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd;
            r.eachCell((cell, col) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                cell.font = { size: 9 };
                cell.alignment = { horizontal: col <= 2 ? 'left' : 'center', vertical: 'middle' };
                cell.border = { bottom: { style: 'hair', color: { argb: 'FFECF0F1' } } };
            });

            r.getCell(7).numFmt = '"Bs. "#,##0.00';
            r.getCell(8).numFmt = '"Bs. "#,##0.00';

            const diffCell = r.getCell(6);
            if (diff < 0)      diffCell.font = { size: 9, bold: true, color: { argb: COLORS.red } };
            else if (diff > 0) diffCell.font = { size: 9, bold: true, color: { argb: COLORS.green } };
        });

        const totReq  = sortedProducts.reduce((s, p) => s + p.totalRequested,        0);
        const totDel  = sortedProducts.reduce((s, p) => s + p.totalDelivered,        0);
        const totRevR = sortedProducts.reduce((s, p) => s + p.totalRevenueRequested, 0);
        const totRevD = sortedProducts.reduce((s, p) => s + p.totalRevenueDelivered, 0);

        const tr = sheet.addRow(['TOTALES', '', sortedProducts.reduce((s, p) => s + p.presaleCount, 0), totReq, totDel, totDel - totReq, totRevR, totRevD]);
        tr.height = 22;
        tr.eachCell(cell => {
            cell.font = { bold: true, size: 10, color: { argb: COLORS.white } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.darkNavy } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        tr.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        tr.getCell(7).numFmt = '"Bs. "#,##0.00';
        tr.getCell(8).numFmt = '"Bs. "#,##0.00';

        sheet.columns = [
            { width: 36 }, { width: 16 }, { width: 14 },
            { width: 18 }, { width: 20 }, { width: 14 },
            { width: 20 }, { width: 22 },
        ];

        sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];
    }

    private applyDetailRowStyle(
        row: ExcelJS.Row,
        rowIdx: number,
        status: string,
        sc: { bg: string; font: string },
        isFirstDetailRow: boolean
    ): void {
        const isEven = rowIdx % 2 === 0;
        const baseBg = isEven ? COLORS.rowEven : COLORS.rowOdd;

        row.eachCell((cell, col) => {
            const useStatusBg = isFirstDetailRow && col === 11;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: useStatusBg ? sc.bg : baseBg } };
            cell.font = { size: 9, name: 'Arial' };
            cell.alignment = { vertical: 'middle' };
            cell.border = { bottom: { style: 'hair', color: { argb: 'FFECF0F1' } } };
        });

        if (isFirstDetailRow) {
            row.getCell(11).font = { bold: true, size: 9, color: { argb: sc.font } };
        }
        row.height = 16;
    }

    private mergeFill(
        sheet: ExcelJS.Worksheet,
        range: string,
        value: string,
        fontSize: number,
        bgColor: string,
        fontColor: string,
        height: number,
        align: 'left' | 'center' | 'right' = 'center',
        italic = false
    ): void {
        sheet.mergeCells(range);
        const startCell = range.split(':')[0];
        const cell = sheet.getCell(startCell);
        cell.value = value;
        cell.font = { bold: !italic, italic, size: fontSize, color: { argb: fontColor }, name: 'Arial' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { horizontal: align, vertical: 'middle' };
        const rowNum = parseInt(startCell.replace(/[A-Z]/g, ''), 10);
        sheet.getRow(rowNum).height = height;
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
            if (!map.has(key)) map.set(key, { userName, userRole, presales: [] });
            map.get(key)!.presales.push(p);
        }
        return Array.from(map.values());
    }
}