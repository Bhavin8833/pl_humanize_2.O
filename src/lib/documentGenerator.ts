import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { jsPDF } from "jspdf";

interface ParsedDocument {
  title: string;
  descriptionParagraphs: string[];
  footer: string;
}

/**
 * Parses raw text into title, description paragraphs, and footer components using layout heuristics.
 */
export function parseDocumentText(text: string): ParsedDocument {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, "\n");
  
  // Split by double/multiple newlines to identify distinct paragraph blocks
  const paragraphs = normalized
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return { title: "", descriptionParagraphs: [], footer: "" };
  }

  if (paragraphs.length === 1) {
    return { title: "", descriptionParagraphs: [paragraphs[0]], footer: "" };
  }

  if (paragraphs.length === 2) {
    // If the first block is short, it's very likely a Title. Otherwise, both are body paragraphs.
    const hasTitle = paragraphs[0].length < 100 && !/[.!?]$/.test(paragraphs[0]);
    if (hasTitle) {
      return { title: paragraphs[0], descriptionParagraphs: [paragraphs[1]], footer: "" };
    } else {
      return { title: "", descriptionParagraphs: paragraphs, footer: "" };
    }
  }

  // Determine if first block is a title: short (< 120 chars) and does not end with sentence punctuation.
  const hasTitle = paragraphs[0].length < 120 && !/[.!?]$/.test(paragraphs[0]);
  
  // Determine if last block is a footer: short (< 150 chars) or starts with typical footer keywords.
  const lastPara = paragraphs[paragraphs.length - 1];
  const hasFooter = lastPara.length < 150 || /^(footer|copyright|page|ref|compiled|author|date|©)/i.test(lastPara);

  let title = "";
  let footer = "";
  let bodyStart = 0;
  let bodyEnd = paragraphs.length;

  if (hasTitle) {
    title = paragraphs[0];
    bodyStart = 1;
  }

  if (hasFooter) {
    footer = paragraphs[paragraphs.length - 1];
    bodyEnd = paragraphs.length - 1;
  }

  // Fallback if bounds overlap
  if (bodyStart >= bodyEnd) {
    return { title: "", descriptionParagraphs: paragraphs, footer: "" };
  }

  const descriptionParagraphs = paragraphs.slice(bodyStart, bodyEnd);
  return { title, descriptionParagraphs, footer };
}

/**
 * Generates a Word (.docx) document as a Blob from the given text.
 */
export async function generateDocx(text: string): Promise<Blob> {
  const { title, descriptionParagraphs, footer } = parseDocumentText(text);

  const children: any[] = [];

  // 1. Add Title Section
  if (title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 32, // 16pt (half-points used by docx library)
            font: "Calibri",
          }),
        ],
        spacing: { after: 360, before: 120 },
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // 2. Add Description (Body Paragraphs)
  descriptionParagraphs.forEach(p => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: p,
            size: 24, // 12pt
            font: "Calibri",
          }),
        ],
        spacing: { after: 240, line: 360 }, // 1.5 line spacing
      })
    );
  });

  // 3. Add Footer Section
  if (footer) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: footer,
            italics: true,
            size: 18, // 9pt
            font: "Calibri",
            color: "666666",
          }),
        ],
        spacing: { before: 480 },
        alignment: AlignmentType.CENTER,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generates a PDF (.pdf) document as a Blob from the given text.
 */
export async function generatePdf(text: string): Promise<Blob> {
  const { title, descriptionParagraphs, footer } = parseDocumentText(text);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxLineWidth = pageWidth - 2 * margin;

  let y = margin;

  // 1. Add Title
  if (title) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    const titleLines = doc.splitTextToSize(title, maxLineWidth);
    titleLines.forEach(line => {
      const textWidth = doc.getTextWidth(line);
      const x = (pageWidth - textWidth) / 2;
      doc.text(line, x, y);
      y += 8;
    });
    y += 6;
  }

  // 2. Add Description (Body Paragraphs)
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(33, 33, 33);
  
  descriptionParagraphs.forEach(para => {
    const lines = doc.splitTextToSize(para, maxLineWidth);
    lines.forEach(line => {
      if (y > pageHeight - margin - 15) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 6; // ~1.5 line height spacing
    });
    y += 4; // Paragraph separation spacing
  });

  // 3. Add Footer
  if (footer) {
    doc.setFont("Helvetica", "oblique");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const footerLines = doc.splitTextToSize(footer, maxLineWidth);
    const footerHeight = footerLines.length * 5;
    
    const footerY = pageHeight - margin - footerHeight;
    if (y > footerY) {
      doc.addPage();
      y = margin;
    }
    
    const finalFooterY = pageHeight - margin - footerHeight;
    footerLines.forEach((line, index) => {
      const textWidth = doc.getTextWidth(line);
      const x = (pageWidth - textWidth) / 2;
      doc.text(line, x, finalFooterY + (index * 5));
    });
  }

  return doc.output("blob");
}

/**
 * Triggers browser-native file download for a given Blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
