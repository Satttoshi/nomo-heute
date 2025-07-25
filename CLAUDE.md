# Norderney Newspaper PDF Viewer - Next.js App

## Project Overview
Build a simple Next.js 15 app for elderly users to view the latest Norderney local newspaper PDF directly in the browser. The app scrapes the latest PDF from https://www.nomo-norderney.de/ausgaben/ and displays it using a React PDF viewer.
MOBILE FIRST!

## Target User
- Elderly user (granny) who finds downloading and opening PDFs difficult
- Needs simple, large interface with minimal complexity
- Just wants to read the latest newspaper without technical hassles

## Technical Requirements

### Framework & Deployment
- **Next.js 15** with App Router and **TypeScript**
- **Server Actions** (instead of API routes) for data fetching
- **Vercel** deployment (free tier)
- **No storage required** - fetch and display only

### Core Libraries to Install
```bash
npm install cheerio axios react-pdf
npm install -D @types/node
```

### Architecture

#### 1. Server Action for PDF Scraping
- **File**: `app/actions/newspaper.ts`
- **Purpose**: Scrape latest PDF URL from newspaper website
- **Library**: Cheerio for HTML parsing
- **Process**:
  1. Fetch HTML from `https://www.nomo-norderney.de/ausgaben/`
  2. Parse with Cheerio to find first (latest) newspaper link
  3. Navigate to individual newspaper page
  4. Extract PDF download URL
  5. Return PDF URL to client
- **Types**: Define proper TypeScript interfaces for return values

#### 2. PDF Viewer Component
- **File**: `app/components/PDFViewer.tsx`
- **Library**: `react-pdf` (most popular React PDF library with 9k+ stars)
- **Features**:
  - Document and Page components for flexible rendering
  - Built-in zoom and navigation controls
  - Responsive design with custom styling
  - Excellent TypeScript support
  - Active community and regular updates
  - Lightweight and performant
- **Types**: Properly typed React component with PDF URL props

#### 3. Main Page
- **File**: `app/page.tsx`
- **Design**: Clean, minimal interface
- **Features**:
  - Auto-load latest newspaper on page load
  - Large fonts and simple navigation
  - Error handling for failed scraping
  - Optional refresh button
- **Types**: Server component with proper action integration

### Scraping Strategy

#### Target Website Analysis
- **Archive Page**: `https://www.nomo-norderney.de/ausgaben/`
- **Structure**: Lists newspapers by date, newest first
- **Pattern**: Links like "Ausgabe vom Freitag dem [25. Juli 2025]"
- **Individual Pages**: Each edition has PDF embedded/downloadable

#### Cheerio Selectors (approximate)
```javascript
// Get first (latest) newspaper link from archive
const latestLink = $('a').first().attr('href');

// On individual page, find PDF download link
const pdfUrl = $('a[href$=".pdf"]').attr('href');
```

### Component Structure
```
app/
├── page.tsx (main PDF viewer page)
├── actions/
│   └── newspaper.ts (server action for scraping)
├── components/
│   ├── PDFViewer.tsx (PDF display component)
│   └── PDFProvider.tsx (PDF library provider wrapper)
├── types/
│   └── newspaper.ts (TypeScript type definitions)
└── globals.css (elderly-friendly styling)
```

### UI/UX Requirements

#### Design Principles
- **Large fonts** (18px+ for body text)
- **High contrast** colors for readability
- **Minimal interface** - no unnecessary buttons/menus
- **Single-page experience** - everything visible at once
- **Mobile-friendly** but primarily desktop-focused

#### Error Handling
- Graceful fallback if scraping fails
- Clear error messages in simple language
- Retry mechanism for temporary failures
- Loading states while fetching

### Next.js 15 Server Actions Implementation

#### TypeScript Types
```typescript
// app/types/newspaper.ts
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
```

#### Server Action Structure
```typescript
'use server'

import cheerio from 'cheerio';
import axios from 'axios';
import { NewspaperResult } from '@/types/newspaper';

export async function getLatestNewspaperPDF(): Promise<NewspaperResult> {
  try {
    // Scraping logic here
    return { 
      success: true, 
      pdfUrl: '...', 
      title: '...', 
      date: '...' 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

#### Client-Side Usage
```typescript
import { getLatestNewspaperPDF } from './actions/newspaper';
import { NewspaperResult } from '@/types/newspaper';

export default async function HomePage() {
  // Use server action with proper typing
  const result: NewspaperResult = await getLatestNewspaperPDF();
}
```

### PDF Viewer Configuration

### PDF Viewer Configuration

#### React PDF Library Setup
The `react-pdf` library is the most popular and well-maintained PDF viewer for React:

**Why react-pdf is the Best Choice:**
- **Most Popular**: 9k+ GitHub stars, widely adopted
- **Active Development**: Regular updates and excellent maintenance
- **Flexible**: Document/Page component structure for custom layouts
- **TypeScript**: Full TypeScript support with proper type definitions
- **Performance**: Efficient rendering with customizable loading
- **Community**: Large community, extensive documentation, many examples

**PDF.js Worker Configuration:**
```typescript
// app/components/PDFViewer.tsx
'use client';
import { pdfjs, Document, Page } from 'react-pdf';
import { useState } from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
}

const PDFViewer = ({ pdfUrl, title }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100">
      {title && (
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{title}</h1>
      )}
      
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => setPageNumber(page => Math.max(1, page - 1))}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 text-lg"
        >
          Previous
        </button>
        <span className="text-lg font-medium">
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={() => setPageNumber(page => Math.min(numPages || 1, page + 1))}
          disabled={pageNumber >= (numPages || 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 text-lg"
        >
          Next
        </button>
      </div>

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="border border-gray-300 shadow-lg"
        loading={
          <div className="flex items-center justify-center h-96">
            <div className="text-xl">Loading newspaper...</div>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-96">
            <div className="text-xl text-red-600">
              Failed to load newspaper. Please try again.
            </div>
          </div>
        }
      >
        <Page 
          pageNumber={pageNumber} 
          scale={1.2} // Larger scale for elderly users
          className="shadow-md"
        />
      </Document>
    </div>
  );
};

export default PDFViewer;
```

#### Next.js 15 Configuration
For Next.js 15, you may need to add this to your `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

#### Viewer Features
- **Modern UI**: Clean, responsive interface with dark/light theme support
- **Elderly-Friendly Config**: Large zoom defaults, simplified toolbar
- **Touch Support**: Works well on tablets and touch devices
- **Keyboard Navigation**: Full keyboard accessibility
- **Search Functionality**: Built-in text search (can be disabled for simplicity)
- **Print Support**: Direct printing capabilities

### Deployment Considerations

#### Vercel Specific
- Server actions work seamlessly on Vercel
- 10-second timeout limit (sufficient for scraping)
- No additional configuration needed
- Edge runtime compatible

#### Performance
- Cache PDF URLs briefly to reduce scraping frequency
- Lazy load PDF viewer component
- Optimize bundle size for faster loading

### Development Priorities

1. **Phase 1**: Basic scraping server action + PDF display
2. **Phase 2**: Error handling and loading states
3. **Phase 3**: UI polish for elderly users
4. **Phase 4**: Deploy and test with target user

### Testing Strategy
- Test scraping with various newspaper editions
- Verify PDF display across different browsers
- Mobile responsiveness testing
- Accessibility testing (screen readers, keyboard navigation)
- Load testing with slow internet connections

### Maintenance Notes
- Website structure may change - monitor scraping reliability
- PDF.js version updates may require worker URL changes
- Vercel free tier limits - monitor usage
- Consider adding basic analytics to track usage patterns

## Getting Started
1. Create Next.js 15 app with App Router and TypeScript: `npx create-next-app@latest --typescript`
2. Install required dependencies (see Core Libraries section)
3. Set up TypeScript types in `app/types/newspaper.ts`
4. Implement server action for scraping in `app/actions/newspaper.ts`
5. Build PDF viewer component in `app/components/PDFViewer.tsx`
6. Create main page connecting everything in `app/page.tsx`
7. Style for elderly user accessibility in `globals.css`
8. Deploy to Vercel
9. Test with actual target user

### TypeScript Configuration Notes
- Ensure `strict: true` in tsconfig.json for better type safety
- Use proper return types for all server actions
- Define interfaces for all data structures
- Handle async operations with proper Promise typing
