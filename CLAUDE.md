# Norderney Newspaper PDF Viewer - Next.js App

## Project Overview
Build a simple Next.js 15 app for elderly users to view the latest Norderney local newspaper PDF directly in the browser. The app scrapes the latest PDF from https://www.nomo-norderney.de/ausgaben/ and displays it using a React PDF viewer.

## Target User
- Elderly user (granny) who finds downloading and opening PDFs difficult
- Needs simple, large interface with minimal complexity
- Just wants to read the latest newspaper without technical hassles

## Technical Requirements

### Framework & Deployment
- **Next.js 15** with App Router
- **Server Actions** (instead of API routes) for data fetching
- **Vercel** deployment (free tier)
- **No storage required** - fetch and display only

### Core Libraries to Install
```bash
npm install cheerio axios @react-pdf-viewer/core @react-pdf-viewer/default-layout
```

### Architecture

#### 1. Server Action for PDF Scraping
- **File**: `app/actions/newspaper.js`
- **Purpose**: Scrape latest PDF URL from newspaper website
- **Library**: Cheerio for HTML parsing
- **Process**:
    1. Fetch HTML from `https://www.nomo-norderney.de/ausgaben/`
    2. Parse with Cheerio to find first (latest) newspaper link
    3. Navigate to individual newspaper page
    4. Extract PDF download URL
    5. Return PDF URL to client

#### 2. PDF Viewer Component
- **File**: `app/components/PDFViewer.jsx`
- **Library**: `@react-pdf-viewer/core` + `@react-pdf-viewer/default-layout`
- **Features**:
    - Full-screen PDF display
    - Zoom controls
    - Page navigation
    - PDF.js worker integration

#### 3. Main Page
- **File**: `app/page.js`
- **Design**: Clean, minimal interface
- **Features**:
    - Auto-load latest newspaper on page load
    - Large fonts and simple navigation
    - Error handling for failed scraping
    - Optional refresh button

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
├── page.js (main PDF viewer page)
├── actions/
│   └── newspaper.js (server action for scraping)
├── components/
│   └── PDFViewer.jsx (PDF display component)
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

#### Server Action Structure
```javascript
'use server'

import cheerio from 'cheerio';
import axios from 'axios';

export async function getLatestNewspaperPDF() {
  try {
    // Scraping logic here
    return { success: true, pdfUrl: '...' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### Client-Side Usage
```javascript
import { getLatestNewspaperPDF } from './actions/newspaper';

export default function HomePage() {
  // Use server action with useActionState or similar
}
```

### PDF Viewer Configuration

#### PDF.js Worker Setup
- Use CDN worker: `https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js`
- Configure in PDF viewer component
- Handle CORS issues if any

#### Viewer Features
- **Default Layout Plugin** for toolbar and navigation
- **Responsive design** for different screen sizes
- **Zoom controls** for elderly users
- **Page navigation** arrows

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
1. Create Next.js 15 app with App Router
2. Install required dependencies
3. Implement server action for scraping
4. Build PDF viewer component
5. Create main page connecting everything
6. Style for elderly user accessibility
7. Deploy to Vercel
8. Test with actual target user
