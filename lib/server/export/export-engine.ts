import { prisma } from '@/lib/db';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export interface ExportRequestParams {
  reportType: 'revenue' | 'aging' | 'providers' | 'insurance' | 'claims' | 'payments';
  format: 'csv' | 'json';
  userId: string;
  userName: string;
}

export class ReportExportEngine {
  static async generateExport(params: ExportRequestParams): Promise<{ filename: string; content: string; mimeType: string }> {
    const { reportType, format, userId, userName } = params;
    let content = '';
    let filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
    let mimeType = format === 'csv' ? 'text/csv' : 'application/json';

    if (reportType === 'claims') {
      const claims = await prisma.claim.findMany({
        where: { isDeleted: false },
        take: 500,
        orderBy: { serviceDate: 'desc' },
      });

      if (format === 'csv') {
        const headers = 'Claim Number,Patient Name,Payer,Service Date,Billed Amount,Paid Amount,Status\n';
        const rows = claims.map((c) => 
          `"${c.claimNumber}","${c.patientName}","${c.insuranceProvider}","${c.serviceDate.toISOString().split('T')[0]}",${c.billedAmount},${c.paidAmount},"${c.status}"`
        ).join('\n');
        content = headers + rows;
      } else {
        content = JSON.stringify(claims, null, 2);
      }
    } else if (reportType === 'payments') {
      const payments = await prisma.payment.findMany({
        where: { isDeleted: false },
        take: 500,
        orderBy: { date: 'desc' },
      });

      if (format === 'csv') {
        const headers = 'Payment Number,Patient Name,Type,Date,Method,Amount,Status\n';
        const rows = payments.map((p) =>
          `"${p.paymentNumber}","${p.patientName}","${p.type}","${p.date.toISOString().split('T')[0]}","${p.method}",${p.amount},"${p.status}"`
        ).join('\n');
        content = headers + rows;
      } else {
        content = JSON.stringify(payments, null, 2);
      }
    } else {
      // Default CSV export for general reports
      content = 'Report Type,Generated Date,Status\n' + `"${reportType}","${new Date().toISOString()}",Completed\n`;
    }

    await AuditLogger.log({
      userId,
      userName,
      action: 'Export',
      module: 'Reports',
      resource: `${reportType.toUpperCase()} Export`,
      details: `Generated ${format.toUpperCase()} export for ${reportType} report`,
    });

    return { filename, content, mimeType };
  }
}
