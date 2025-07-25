'use client';

interface ErrorPageProps {
  error: string;
}

export default function ErrorPage({ error }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-red-100 border border-red-300 rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-800 mb-4">
          Fehler beim Laden der Zeitung
        </h1>
        <p className="text-lg text-red-700 mb-6">
          {error || 'Die Zeitung konnte nicht geladen werden.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}