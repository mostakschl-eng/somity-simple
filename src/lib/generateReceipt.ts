import jsPDF from 'jspdf';
import type { Profile, MonthlyRecord } from './api';

function formatBDT(amount: number | null | undefined): string {
  if (amount == null) return '0.00';
  return Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

export function generateReceiptPDF(record: MonthlyRecord, member: Profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = w - margin * 2;
  let y = 20;

  // Colors
  const primary = [26, 107, 90] as const;    // teal
  const dark = [20, 30, 35] as const;
  const muted = [100, 115, 125] as const;
  const light = [240, 245, 248] as const;
  const accent = [220, 140, 20] as const;

  // ===== HEADER BAR =====
  doc.setFillColor(...primary);
  doc.rect(0, 0, w, 38, 'F');

  // Logo circle
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 12, 19, 10, 'F');
  doc.setFillColor(...primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primary);
  doc.text('S', margin + 12, 23, { align: 'center' });

  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SOMITY MANAGER', margin + 28, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Payment Receipt', margin + 28, 23);

  // Receipt No - right side
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt: ${record.receipt_no || 'N/A'}`, w - margin, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${record.date || new Date().toLocaleDateString()}`, w - margin, 23, { align: 'right' });

  y = 48;

  // ===== MEMBER INFO BOX =====
  doc.setFillColor(...light);
  doc.roundedRect(margin, y, contentW, 32, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('MEMBER NAME', margin + 6, y + 8);
  doc.text('MEMBER NO', margin + contentW / 2 + 4, y + 8);
  doc.text('MOBILE', margin + 6, y + 20);
  doc.text('FINANCIAL YEAR', margin + contentW / 2 + 4, y + 20);

  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.text(member.name || '-', margin + 6, y + 14);
  doc.text(member.member_no || '-', margin + contentW / 2 + 4, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(member.mobile || '-', margin + 6, y + 26);
  doc.text(member.financial_year || '-', margin + contentW / 2 + 4, y + 26);

  y += 40;

  // ===== PERIOD BADGE =====
  const periodText = `${record.month_name} ${record.year}`;
  doc.setFillColor(...primary);
  doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Period: ${periodText}`, w / 2, y + 7, { align: 'center' });

  y += 18;

  // ===== PAYMENT DETAILS TABLE =====
  const items: [string, string][] = [
    ['Monthly Deposit', formatBDT(record.monthly_deposit)],
    ['Misc. Expense', formatBDT(record.misc_expense)],
    ['Late Fine', formatBDT(record.late_fine)],
    ['One-time Payment', formatBDT(record.one_time)],
  ];

  // Table Header
  doc.setFillColor(...dark);
  doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', margin + 6, y + 6.5);
  doc.text('AMOUNT (BDT)', w - margin - 6, y + 6.5, { align: 'right' });
  y += 9;

  // Table Rows
  items.forEach((item, i) => {
    const rowY = y + i * 10;
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY, contentW, 10, 'F');
    }
    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item[0], margin + 6, rowY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item[1]}`, w - margin - 6, rowY + 7, { align: 'right' });
  });

  y += items.length * 10;

  // Divider line
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, w - margin, y + 2);
  y += 6;

  // Total row
  doc.setFillColor(...primary);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT', margin + 6, y + 8.5);
  doc.text(`BDT ${formatBDT(record.total_amount)}`, w - margin - 6, y + 8.5, { align: 'right' });

  y += 20;

  // ===== BALANCE SUMMARY =====
  doc.setFillColor(255, 250, 240);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 36, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(...accent);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT SUMMARY', margin + 6, y + 7);

  const summaryItems: [string, string, readonly [number, number, number]][] = [
    ['Due Amount', formatBDT(record.due), [200, 50, 50]],
    ['Total Deposit', formatBDT(record.total_deposit), primary],
    ['Current Balance', formatBDT(record.current_balance), dark],
  ];

  summaryItems.forEach((item, i) => {
    const sx = margin + 6 + (i * (contentW - 12) / 3);
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'normal');
    doc.text(item[0], sx, y + 16);
    doc.setFontSize(12);
    doc.setTextColor(...item[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item[1]}`, sx, y + 24);
  });

  y += 44;

  // ===== FOOTER =====
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.2);
  doc.line(margin, y, w - margin, y);
  y += 8;

  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated receipt. No signature required.', w / 2, y, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, w / 2, y + 5, { align: 'center' });
  doc.text('Somity Manager - Monthly Collection Management System', w / 2, y + 10, { align: 'center' });

  // Bottom bar
  doc.setFillColor(...primary);
  doc.rect(0, 290, w, 7, 'F');

  // Save with member name
  const safeName = member.name?.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_') || 'member';
  doc.save(`Receipt_${safeName}_${record.month_name}_${record.year}.pdf`);
}
