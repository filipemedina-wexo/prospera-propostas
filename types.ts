export enum ItemType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING'
}

export interface QuoteItem {
  id: string;
  description: string;
  amount: number;
  type: ItemType;
}

export interface PaymentMethod {
  id: string;
  name: string;
  discountPercent: number;
}

export interface Service {
  id: string;
  description: string;
  amount: number;
  type: ItemType;
  userEmail?: string;
}

export interface Quote {
  id: string;
  clientName: string;
  clientEmail?: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  validUntil: string; // ISO date string
  productionDays: number;
  items: QuoteItem[];
  paymentMethodId: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'EXPIRED';
  userEmail?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pix', name: 'PIX (5% de desconto)', discountPercent: 5 },
  { id: 'credit_card', name: 'Cartão de Crédito (Sem desconto)', discountPercent: 0 },
  { id: 'boleto', name: 'Boleto Bancário (Sem desconto)', discountPercent: 0 },
];
