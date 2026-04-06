import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import { Response } from 'express';
import { IndividualClientRecord } from '../models/IndividualClient';
import { BusinessClientRecord } from '../models/BusinessClient';
import { SettingsRecord } from '../models/Settings';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getTranslations } from '../utils/i18n';
import path from 'path';
import os from 'os';
import fs from 'fs';

export class ExportService {
  exportIndividualClientsPdf(
    clients: IndividualClientRecord[],
    settings: SettingsRecord,
    res: Response
  ): void {
    const translations = getTranslations(settings.language);
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="clientes-pf.pdf"');
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(translations['reportTitle'], { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(
      `${translations['generatedAt']}: ${formatDate(new Date().toISOString(), settings)}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Table headers
    const headers = [
      translations['fullName'],
      translations['email'],
      translations['category'],
      translations['balance'],
      translations['age'],
    ];
    const colWidths = [160, 150, 80, 90, 40];
    let x = 40;
    const headerY = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(h, x, headerY, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });

    doc.moveTo(40, doc.y + 4).lineTo(560, doc.y + 4).stroke();
    doc.moveDown(0.5);

    // Table rows
    doc.fontSize(8).font('Helvetica');
    for (const client of clients) {
      if (doc.y > 700) {
        doc.addPage();
      }
      x = 40;
      const rowY = doc.y;
      const row = [
        client.fullName,
        client.email || '-',
        client.category,
        formatCurrency(client.balance, settings),
        String(client.age),
      ];
      row.forEach((val, i) => {
        doc.text(val, x, rowY, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      doc.moveDown(0.5);
    }

    doc.end();
  }

  exportBusinessClientsPdf(
    clients: BusinessClientRecord[],
    settings: SettingsRecord,
    res: Response
  ): void {
    const translations = getTranslations(settings.language);
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="clientes-pj.pdf"');
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text(translations['reportTitle'], { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(
      `${translations['generatedAt']}: ${formatDate(new Date().toISOString(), settings)}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    const headers = [
      translations['companyName'],
      translations['tradeName'],
      translations['cnpj'],
      translations['category'],
      translations['balance'],
    ];
    const colWidths = [130, 110, 100, 80, 100];
    let x = 40;
    const headerY = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(h, x, headerY, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });

    doc.moveTo(40, doc.y + 4).lineTo(560, doc.y + 4).stroke();
    doc.moveDown(0.5);

    doc.fontSize(8).font('Helvetica');
    for (const client of clients) {
      if (doc.y > 700) {
        doc.addPage();
      }
      x = 40;
      const rowY = doc.y;
      const row = [
        client.companyName,
        client.tradeName,
        client.cnpj,
        client.category,
        formatCurrency(client.balance, settings),
      ];
      row.forEach((val, i) => {
        doc.text(val, x, rowY, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      doc.moveDown(0.5);
    }

    doc.end();
  }

  async exportIndividualClientsCsv(
    clients: IndividualClientRecord[],
    settings: SettingsRecord,
    res: Response
  ): Promise<void> {
    const translations = getTranslations(settings.language);
    const tmpFile = path.join(os.tmpdir(), `pf-${Date.now()}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: tmpFile,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'fullName', title: translations['fullName'] },
        { id: 'email', title: translations['email'] },
        { id: 'phone', title: translations['phone'] },
        { id: 'category', title: translations['category'] },
        { id: 'age', title: translations['age'] },
        { id: 'monthlyIncome', title: translations['monthlyIncome'] },
        { id: 'balance', title: translations['balance'] },
        { id: 'createdAt', title: 'Data de Cadastro' },
      ],
    });

    const records = clients.map(c => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      category: c.category,
      age: c.age,
      monthlyIncome: c.monthlyIncome,
      balance: c.balance,
      createdAt: formatDate(c.createdAt, settings),
    }));

    await csvWriter.writeRecords(records);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="clientes-pf.csv"');

    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on('end', () => {
      fs.unlink(tmpFile, () => {});
    });
  }

  async exportBusinessClientsCsv(
    clients: BusinessClientRecord[],
    settings: SettingsRecord,
    res: Response
  ): Promise<void> {
    const translations = getTranslations(settings.language);
    const tmpFile = path.join(os.tmpdir(), `pj-${Date.now()}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: tmpFile,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'companyName', title: translations['companyName'] },
        { id: 'tradeName', title: translations['tradeName'] },
        { id: 'cnpj', title: translations['cnpj'] },
        { id: 'email', title: translations['email'] },
        { id: 'phone', title: translations['phone'] },
        { id: 'category', title: translations['category'] },
        { id: 'balance', title: translations['balance'] },
        { id: 'createdAt', title: 'Data de Cadastro' },
      ],
    });

    const records = clients.map(c => ({
      id: c.id,
      companyName: c.companyName,
      tradeName: c.tradeName,
      cnpj: c.cnpj,
      email: c.email,
      phone: c.phone,
      category: c.category,
      balance: c.balance,
      createdAt: formatDate(c.createdAt, settings),
    }));

    await csvWriter.writeRecords(records);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="clientes-pj.csv"');

    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on('end', () => {
      fs.unlink(tmpFile, () => {});
    });
  }
}
