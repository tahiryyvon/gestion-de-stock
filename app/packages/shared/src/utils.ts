// Utilitaires partagés

// Génération du numéro de ticket au format YYYYMMDD-XXXX
export function generateTicketNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.getTime().toString().slice(-4);
  return `${dateStr}-${timeStr}`;
}

// Calcul du hash pour la conformité NF525
export function calculateSaleHash(saleData: any, previousHash: string = ''): string {
  const data = JSON.stringify({
    numero: saleData.numero,
    date: saleData.date,
    totalTTC: saleData.totalTTC,
    items: saleData.items,
    previousHash,
  });
  
  // Implémentation basique - à remplacer par une vraie fonction de hash cryptographique
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Formatage des prix
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Formatage des dates
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Calculs de vente
export function calculateTVA(prixHT: number, tauxTVA: number): number {
  return (prixHT * tauxTVA) / 100;
}

export function calculateTTC(prixHT: number, tauxTVA: number): number {
  return prixHT + calculateTVA(prixHT, tauxTVA);
}

export function calculateHT(prixTTC: number, tauxTVA: number): number {
  return prixTTC / (1 + tauxTVA / 100);
}

// Validation des codes-barres (EAN13 basique)
export function isValidBarcode(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;
  
  const digits = barcode.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}

// Génération de référence produit
export function generateProductReference(prefix: string = 'PRD'): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp.slice(-6)}${random}`;
}

// Calcul du stock actuel basé sur les mouvements
export function calculateCurrentStock(movements: any[]): number {
  return movements.reduce((stock, movement) => {
    if (movement.type === 'ENTRY') {
      return stock + movement.quantity;
    } else {
      return stock - movement.quantity;
    }
  }, 0);
}

// Vérification des permissions utilisateur
export function hasPermission(userRole: string, requiredRole: string): boolean {
  if (userRole === 'ADMIN') return true;
  return userRole === requiredRole;
}

export function canAccessResource(userRole: string, resource: string): boolean {
  const permissions: Record<string, string[]> = {
    'ADMIN': ['products', 'categories', 'stock', 'sales', 'reports', 'users', 'settings'],
    'VENDEUR': ['sales', 'stock-read'],
  };
  
  return permissions[userRole]?.includes(resource) || false;
}