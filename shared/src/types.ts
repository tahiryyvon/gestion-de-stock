// Types partagés entre web et desktop
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'VENDEUR';
  actif: boolean;
}

export interface Product {
  id: string;
  codeBarre?: string;
  reference: string;
  nom: string;
  description?: string;
  categorieId: string;
  prixAchat: number;
  prixVente: number;
  tva: number;
  seuilAlerte: number;
  imageUrl?: string;
  variations?: any;
  actif: boolean;
  stockActuel?: number; // Calculé dynamiquement
  categorie?: Category;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  actif: boolean;
}

export interface Sale {
  id: string;
  numero: string;
  date: string;
  userId: string;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  remise?: number;
  statut: 'COMPLETED' | 'REFUNDED' | 'CANCELLED';
  items: SaleItem[];
  payments: Payment[];
  user?: User;
  previousHash?: string;
  hash?: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  prixUnitaire: number;
  tva: number;
  remise?: number;
  product?: Product;
}

export interface Payment {
  id: string;
  saleId: string;
  mode: 'CASH' | 'CARD' | 'CHECK' | 'TRANSFER';
  montant: number;
}

export interface StockMovement {
  id: string;
  type: 'ENTRY' | 'EXIT_SALE' | 'EXIT_MANUAL';
  quantity: number;
  productId: string;
  userId?: string;
  saleId?: string;
  motif?: string;
  fournisseur?: string;
  createdAt: string;
  product?: Product;
  user?: User;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  prixUnitaire: number;
  remise?: number;
}

export interface SaleFormData {
  items: {
    productId: string;
    quantity: number;
    prixUnitaire: number;
    tva: number;
    remise?: number;
  }[];
  payments: {
    mode: 'CASH' | 'CARD' | 'CHECK' | 'TRANSFER';
    montant: number;
  }[];
  remise?: number;
}

export interface SyncAction {
  id: string;
  action: string;
  data: any;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  totalProduits: number;
  totalCategories: number;
  totalFournisseurs: number;
  valeurStock: number;
  caJour: number;
  produitsRupture: number;
}