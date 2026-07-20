import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";

export interface SentenceItem {
  text: string;
  status: "unique" | "similar" | "highly_similar";
  similarity?: number;
}

export interface PlagiarismReportData {
  originalityScore: number;
  similarityScore: number;
  totalWords: number;
  totalSentences: number;
  duplicateSentences: number;
  uniqueSentences: number;
  sentences?: SentenceItem[];
  originalText: string;
}

/**
 * Generates a clean PDF Plagiarism Report using jsPDF
 */
export async function generatePlagiarismPdfReport(data: PlagiarismReportData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate header
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("PL HUMANIZER - PLAGIARISM REPORT", margin, 25);

  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 25);

  y = 52;

  // Summary Metrics Section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Executive Summary", margin, y);
  y += 10;

  // Draw 2 Stat Cards Side by Side
  const cardWidth = (pageWidth - 2 * margin - 10) / 2;
  
  // Originality Card
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, cardWidth, 24, 3, 3, "FD");
  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52);
  doc.text("Originality Score", margin + 8, y + 10);
  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  doc.text(`${data.originalityScore.toFixed(1)}%`, margin + 8, y + 20);

  // Similarity Card
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin + cardWidth + 10, y, cardWidth, 24, 3, 3, "FD");
  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(153, 27, 27);
  doc.text("Similarity Score", margin + cardWidth + 18, y + 10);
  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  doc.text(`${data.similarityScore.toFixed(1)}%`, margin + cardWidth + 18, y + 20);

  y += 32;

  // Key Metrics Table
  doc.setFontSize(11);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Document Metrics", margin, y);
  y += 6;

  const metrics = [
    ["Total Words", data.totalWords.toLocaleString()],
    ["Total Sentences", data.totalSentences.toLocaleString()],
    ["Unique Sentences", data.uniqueSentences.toLocaleString()],
    ["Duplicate / Similar Sentences", data.duplicateSentences.toLocaleString()],
  ];

  metrics.forEach(([label, val]) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(label, margin + 4, y + 5.5);
    doc.setFont("Helvetica", "bold");
    doc.text(val, pageWidth - margin - 25, y + 5.5);
    y += 9;
  });

  y += 10;

  // Document Text Breakdown Section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Analyzed Text Content", margin, y);
  y += 8;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const lines = doc.splitTextToSize(data.originalText, pageWidth - 2 * margin);
  lines.forEach((line: string) => {
    if (y > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 5.5;
  });

  return doc.output("blob");
}

/**
 * Generates a clean DOCX Plagiarism Report using docx library
 */
export async function generatePlagiarismDocxReport(data: PlagiarismReportData): Promise<Blob> {
  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "PL HUMANIZER - PLAGIARISM REPORT",
          bold: true,
          size: 32,
          font: "Calibri",
          color: "0F172A",
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated Date: ${new Date().toLocaleString()}`,
          size: 18,
          italic: true,
          font: "Calibri",
          color: "64748B",
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Summary Table
  const summaryTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Originality Score", bold: true, size: 20, font: "Calibri", color: "166534" }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${data.originalityScore.toFixed(1)}%`, bold: true, size: 36, font: "Calibri", color: "166534" }),
                ],
              }),
            ],
            shading: { fill: "F0FDF4" },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Similarity Score", bold: true, size: 20, font: "Calibri", color: "991B1B" }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${data.similarityScore.toFixed(1)}%`, bold: true, size: 36, font: "Calibri", color: "991B1B" }),
                ],
              }),
            ],
            shading: { fill: "FEF2F2" },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  children.push(summaryTable);

  // Document Metrics Heading
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Document Metrics Summary",
          bold: true,
          size: 24,
          font: "Calibri",
          color: "0F172A",
        }),
      ],
      spacing: { before: 300, after: 120 },
    })
  );

  // Metrics Table
  const metricsRows = [
    ["Total Words", data.totalWords.toLocaleString()],
    ["Total Sentences", data.totalSentences.toLocaleString()],
    ["Unique Sentences", data.uniqueSentences.toLocaleString()],
    ["Duplicate / Similar Sentences", data.duplicateSentences.toLocaleString()],
  ];

  const metricsTable = new Table({
    rows: metricsRows.map(([label, val]) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: label, size: 20, font: "Calibri" })],
              }),
            ],
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: val, bold: true, size: 20, font: "Calibri" })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
          }),
        ],
      });
    }),
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  children.push(metricsTable);

  // Original Text Content
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Analyzed Text Content",
          bold: true,
          size: 24,
          font: "Calibri",
          color: "0F172A",
        }),
      ],
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.originalText,
          size: 22,
          font: "Calibri",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBlob(doc);
}
