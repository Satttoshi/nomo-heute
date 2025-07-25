'use server'

import axios from 'axios';
import { NewspaperResult } from '@/app/types/newspaper';

const BASE_URL = 'https://www.nomo-norderney.de';

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}_${month}_${year}`;
}

function formatDisplayDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}.${month}.${year}`;
}

function generatePdfUrl(date: Date): string {
  const formattedDate = formatDate(date);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${BASE_URL}/media/ausgaben/${year}/${month}/nomo_${formattedDate}.pdf`;
}

async function checkPdfExists(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NoMo-PDF-Viewer/1.0)',
      },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

export async function getLatestNewspaperPDF(): Promise<NewspaperResult> {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Try today first
    const todayUrl = generatePdfUrl(today);
    console.log('Checking today\'s PDF:', todayUrl);
    
    if (await checkPdfExists(todayUrl)) {
      return {
        success: true,
        pdfUrl: todayUrl,
        title: `Norderneyer Morgen - ${formatDisplayDate(today)}`,
        date: formatDisplayDate(today),
      };
    }
    
    // Fall back to yesterday
    const yesterdayUrl = generatePdfUrl(yesterday);
    console.log('Checking yesterday\'s PDF:', yesterdayUrl);
    
    if (await checkPdfExists(yesterdayUrl)) {
      return {
        success: true,
        pdfUrl: yesterdayUrl,
        title: `Norderneyer Morgen - ${formatDisplayDate(yesterday)}`,
        date: formatDisplayDate(yesterday),
      };
    }
    
    // If neither exists, try a few more days back
    for (let i = 2; i <= 7; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - i);
      const pastUrl = generatePdfUrl(pastDate);
      
      console.log(`Checking ${i} days ago PDF:`, pastUrl);
      
      if (await checkPdfExists(pastUrl)) {
        return {
          success: true,
          pdfUrl: pastUrl,
          title: `Norderneyer Morgen - ${formatDisplayDate(pastDate)}`,
          date: formatDisplayDate(pastDate),
        };
      }
    }
    
    throw new Error('Keine aktuelle Zeitung gefunden');
    
  } catch (error) {
    console.error('Error fetching newspaper:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Laden der Zeitung',
    };
  }
}