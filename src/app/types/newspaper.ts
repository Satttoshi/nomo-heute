export interface NewspaperResult {
  success: boolean;
  pdfUrl?: string;
  error?: string;
  title?: string;
  date?: string;
}

export interface ScrapingError {
  message: string;
  code: 'NETWORK_ERROR' | 'PARSING_ERROR' | 'PDF_NOT_FOUND';
}