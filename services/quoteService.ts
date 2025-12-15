import { Quote } from '../types';

const STORAGE_KEY = 'prospera_quotes';

// Generate a random 6-character ID (Numbers and Uppercase Letters)
export const generateShortId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars like I, 1, O, 0
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const saveQuote = (quote: Quote): void => {
  const existingJSON = localStorage.getItem(STORAGE_KEY);
  const quotes: Record<string, Quote> = existingJSON ? JSON.parse(existingJSON) : {};
  
  quotes[quote.id] = quote;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
};

export const updateQuoteStatus = (id: string, status: Quote['status']): Quote | null => {
  const existingJSON = localStorage.getItem(STORAGE_KEY);
  if (!existingJSON) return null;

  const quotes: Record<string, Quote> = JSON.parse(existingJSON);
  if (quotes[id]) {
    quotes[id].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    return quotes[id];
  }
  return null;
};

export const getQuote = (id: string): Quote | null => {
  const existingJSON = localStorage.getItem(STORAGE_KEY);
  if (!existingJSON) return null;
  
  const quotes: Record<string, Quote> = JSON.parse(existingJSON);
  return quotes[id] || null;
};

export const getAllQuotes = (): Quote[] => {
  const existingJSON = localStorage.getItem(STORAGE_KEY);
  if (!existingJSON) return [];
  
  const quotes: Record<string, Quote> = JSON.parse(existingJSON);
  return Object.values(quotes).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
