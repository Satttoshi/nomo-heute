'use client';

import { pdfjs, Document, Page } from 'react-pdf';
import { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


const PDFViewer = ({ pdfUrl }: { pdfUrl: string }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [pageWidth, setPageWidth] = useState<number>(800);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
    setError('');
  }

  function onDocumentLoadError(error: Error): void {
    setLoading(false);
    setError('Die Zeitung konnte nicht geladen werden. Bitte versuchen Sie es später noch einmal.');
    console.error('PDF loading error:', error);
  }

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
    // Reset zoom when changing pages
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages || 1, page + 1));
    // Reset zoom when changing pages
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  const zoomIn = () => {
    if (transformRef.current) {
      transformRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (transformRef.current) {
      transformRef.current.zoomOut();
    }
  };

  const resetZoom = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  useEffect(() => {
    const updatePageWidth = () => {
      if (typeof window !== 'undefined') {
        setPageWidth(Math.min(window.innerWidth - 16, 1200));
      }
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="p-6 bg-red-100 border border-red-300 rounded-lg max-w-md">
          <p className="text-xl text-red-800 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-zoom-container">
      {/* Fixed Header Navigation */}
      {numPages && numPages > 1 && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          {/* Mobile: Full width layout */}
          <div className="flex items-center justify-between px-4 py-3 md:hidden">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 text-lg font-semibold transition-colors hover:bg-blue-700 disabled:hover:bg-gray-300 mr-2"
            >
              ← Zurück
            </button>

            <div className="flex-shrink-0 mx-4 text-center">
              <span className="text-lg font-medium text-gray-700 whitespace-nowrap">
                {pageNumber} / {numPages}
              </span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 text-lg font-semibold transition-colors hover:bg-blue-700 disabled:hover:bg-gray-300 ml-2"
            >
              Weiter →
            </button>
          </div>

          {/* Desktop: Centered layout */}
          <div className="hidden md:flex items-center justify-center px-4 py-3">
            <div className="flex items-center gap-6">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="py-3 px-8 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 text-lg font-semibold transition-colors hover:bg-blue-700 disabled:hover:bg-gray-300"
              >
                ← Zurück
              </button>

              <div className="text-center min-w-[100px]">
                <span className="text-lg font-medium text-gray-700 whitespace-nowrap">
                  {pageNumber} / {numPages}
                </span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="py-3 px-8 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 text-lg font-semibold transition-colors hover:bg-blue-700 disabled:hover:bg-gray-300"
              >
                Weiter →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Content Area with zoom/pan support */}
      <div className="pdf-content-area flex justify-center">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.8}
          maxScale={6}
          centerOnInit={true}
          doubleClick={{ mode: "reset" }}
          smooth={false}
        >
          <TransformComponent
            wrapperClass="w-full !h-full"
            contentClass="flex justify-center items-start"
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-screen">
                  <div className="text-2xl text-gray-600 text-center">
                    <div className="mb-4">📰</div>
                    <div>Zeitung wird geladen...</div>
                  </div>
                </div>
              }
              error={null}
              className="shadow-lg rounded-lg overflow-hidden bg-white"
            >
              <Page
                pageNumber={pageNumber}
                width={Math.min(pageWidth, 900)}
                className="mx-auto"
                loading={
                  <div className="flex items-center justify-center h-96">
                    <div className="text-xl text-gray-600">Seite wird geladen...</div>
                  </div>
                }
              />
            </Document>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Fixed Footer with Zoom Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Mobile: Full width layout */}
        <div className="flex items-center justify-center px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={zoomOut}
              className="py-3 px-6 bg-green-600 text-white rounded-lg font-bold transition-colors hover:bg-green-700"
              title="Verkleinern"
            >
              − Kleiner
            </button>

            <button
              onClick={resetZoom}
              className="py-2 px-4 bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors hover:bg-gray-600"
              title="Normal"
            >
              Normal
            </button>

            <button
              onClick={zoomIn}
              className="py-3 px-6 bg-green-600 text-white rounded-lg font-bold transition-colors hover:bg-green-700"
              title="Vergrößern"
            >
              + Größer
            </button>
          </div>
        </div>

        {/* Desktop: Centered layout */}
        <div className="hidden md:flex items-center justify-center px-4 py-3">
          <div className="flex items-center gap-6">
            <button
              onClick={zoomOut}
              className="py-3 px-8 bg-green-600 text-white rounded-lg text-xl font-bold transition-colors hover:bg-green-700"
              title="Verkleinern"
            >
              − Verkleinern
            </button>

            <button
              onClick={resetZoom}
              className="py-2 px-6 bg-gray-500 text-white rounded-lg text-lg font-medium transition-colors hover:bg-gray-600"
              title="Normal"
            >
              Normal
            </button>

            <button
              onClick={zoomIn}
              className="py-3 px-8 bg-green-600 text-white rounded-lg text-xl font-bold transition-colors hover:bg-green-700"
              title="Vergrößern"
            >
              + Vergrößern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
