'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getLatestNewspaperPDF } from './actions/newspaper';
import ErrorPage from './components/ErrorPage';
import { NewspaperResult } from './types/newspaper';

const PDFViewer = dynamic(() => import('./components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-2xl text-gray-600 text-center">
        <div className="mb-4">📰</div>
        <div>PDF Viewer wird geladen...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  const [result, setResult] = useState<NewspaperResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewspaper = async () => {
      try {
        const data = await getLatestNewspaperPDF();
        setResult(data);
      } catch {
        setResult({
          success: false,
          error: 'Fehler beim Laden der Zeitung',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewspaper();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Zeitung wird geladen...
          </h1>
          <p className="text-lg text-gray-600">
            Bitte warten Sie einen Moment
          </p>
        </div>
      </div>
    );
  }

  if (!result || !result.success) {
    return <ErrorPage error={result?.error || 'Die Zeitung konnte nicht geladen werden.'} />;
  }

  // Use the proxy URL to avoid CORS issues
  const proxyPdfUrl = `/api/pdf-proxy?url=${encodeURIComponent(result.pdfUrl!)}`;
  
  console.log('Original PDF URL:', result.pdfUrl);
  console.log('Proxy PDF URL:', proxyPdfUrl);

  return (
    <main>
      <PDFViewer 
        pdfUrl={proxyPdfUrl}
      />
    </main>
  );
}
