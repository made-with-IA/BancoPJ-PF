declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margins?: { top: number; left: number; bottom: number; right: number };
    layout?: 'portrait' | 'landscape';
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
    };
  }

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    pipe(destination: NodeJS.WritableStream): this;
    fontSize(size: number): this;
    font(font: string): this;
    text(text: string, x?: number, y?: number, options?: object): this;
    text(text: string, options?: object): this;
    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    rect(x: number, y: number, w: number, h: number): this;
    fill(color?: string): this;
    x: number;
    y: number;
    page: { width: number; height: number };
    end(): void;
    on(event: string, callback: (...args: unknown[]) => void): this;
    flushPages(): void;
    addPage(options?: PDFDocumentOptions): this;
  }

  export = PDFDocument;
}
