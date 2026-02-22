import { z } from 'zod';

// Schémas de validation pour l'authentification
export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'VENDEUR']).default('VENDEUR'),
});

// Schémas pour les produits
export const ProductSchema = z.object({
  codeBarre: z.string().optional(),
  reference: z.string().min(1, 'Référence requise'),
  nom: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  categorieId: z.string().uuid('Catégorie invalide'),
  prixAchat: z.number().min(0, 'Prix d\'achat invalide'),
  prixVente: z.number().min(0, 'Prix de vente invalide'),
  tva: z.number().min(0).max(100, 'TVA invalide'),
  seuilAlerte: z.number().int().min(0, 'Seuil d\'alerte invalide'),
  imageUrl: z.string().url().optional(),
  variations: z.any().optional(),
  actif: z.boolean().default(true),
});

// Schémas pour les catégories
export const CategorySchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  actif: z.boolean().default(true),
});

// Schémas pour les mouvements de stock
export const StockMovementSchema = z.object({
  type: z.enum(['ENTRY', 'EXIT_SALE', 'EXIT_MANUAL']),
  quantity: z.number().int().min(1, 'Quantité invalide'),
  productId: z.string().uuid('Produit invalide'),
  motif: z.string().optional(),
  fournisseur: z.string().optional(),
});

// Schémas pour les ventes
export const SaleItemSchema = z.object({
  productId: z.string().uuid('Produit invalide'),
  quantity: z.number().int().min(1, 'Quantité invalide'),
  prixUnitaire: z.number().min(0, 'Prix unitaire invalide'),
  tva: z.number().min(0).max(100, 'TVA invalide'),
  remise: z.number().min(0).optional(),
});

export const PaymentSchema = z.object({
  mode: z.enum(['CASH', 'CARD', 'CHECK', 'TRANSFER']),
  montant: z.number().min(0, 'Montant invalide'),
});

export const SaleSchema = z.object({
  items: z.array(SaleItemSchema).min(1, 'Au moins un article requis'),
  payments: z.array(PaymentSchema).min(1, 'Au moins un paiement requis'),
  remise: z.number().min(0).optional(),
});

// Schémas pour les fournisseurs
export const FournisseurSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  contact: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  adresse: z.string().optional(),
  actif: z.boolean().default(true),
});

export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type ProductData = z.infer<typeof ProductSchema>;
export type CategoryData = z.infer<typeof CategorySchema>;
export type StockMovementData = z.infer<typeof StockMovementSchema>;
export type SaleData = z.infer<typeof SaleSchema>;
export type SaleItemData = z.infer<typeof SaleItemSchema>;
export type PaymentData = z.infer<typeof PaymentSchema>;
export type FournisseurData = z.infer<typeof FournisseurSchema>;