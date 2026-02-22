# 📦 Logiciel de Gestion de Stock & Caisse

Application complète de gestion de stock avec caisse enregistreuse intégrée, fonctionnant en mode **web** (hébergé sur serveur) et **desktop** (offline sur PC) avec synchronisation automatique.

## 🚀 Fonctionnalités Principales

### 👥 Gestion des Utilisateurs
- **Admin** : Gestion complète (produits, stock, rapports, utilisateurs)
- **Vendeur** : Utilisation caisse + consultation stock

### 📋 Modules Fonctionnels
- **Gestion des produits** : CRUD complet, codes-barres, catégories
- **Gestion du stock** : Entrées/sorties, alertes, mouvements
- **Caisse enregistreuse** : Ventes, paiements multiples, tickets
- **Rapports** : CA, marges, top produits, inventaires
- **Synchronisation** : Offline-first avec sync automatique
- **Conformité NF525** : Journal des ventes inaltérable

## 🛠️ Technologies Utilisées

### Frontend & Backend
- **Next.js** 14 (React, TypeScript)
- **NextAuth.js** (Authentification JWT)
- **Tailwind CSS** (Interface utilisateur)
- **React Hook Form** + **Zod** (Formulaires et validation)

### Base de données
- **PostgreSQL** + **Prisma ORM** (Serveur)
- **PGlite** + **Drizzle ORM** (Local desktop)

### Desktop
- **Electron** (Application Windows)
- **Synchronisation** automatique online/offline

## 📁 Structure du Projet (Monorepo)

```
app/
├── packages/
│   ├── web/                 # Application Next.js
│   │   ├── src/
│   │   │   ├── pages/       # Pages et API routes
│   │   │   ├── components/  # Composants React
│   │   │   └── styles/      # Styles CSS
│   │   └── package.json
│   ├── desktop/             # Configuration Electron
│   ├── shared/              # Code partagé (types, utils)
│   └── sync-api/            # API de synchronisation
├── prisma/                  # Schémas base serveur
├── drizzle/                 # Schémas base locale
└── package.json
```

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** >= 18.0.0
- **PostgreSQL** (pour la base serveur)
- **npm** ou **yarn**

### 1. Installation des dépendances

```bash
# Dans le dossier racine
npm install

# Installation des dépendances de tous les packages
npm install --workspaces
```

### 2. Configuration de la base de données

```bash
# Copier le fichier d'environnement
cp packages/web/.env.example packages/web/.env.local

# Éditer le fichier .env.local avec vos paramètres :
# DATABASE_URL="postgresql://username:password@localhost:5432/gestion_stock"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Initialisation de la base de données

```bash
# Générer le client Prisma
cd packages/web
npx prisma generate

# Créer et migrer la base de données
npx prisma migrate dev --name init

# Insérer les données d'exemple
npx prisma db seed
```

### 4. Démarrage en développement

```bash
# Mode web (depuis la racine)
npm run dev

# Ou directement dans le package web
cd packages/web
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

### 5. Comptes de démonstration

Après l'initialisation, vous pouvez vous connecter avec :

**Administrateur :**
- Email : `admin@example.com`
- Mot de passe : `admin123`

**Vendeur :**
- Email : `vendeur@example.com`
- Mot de passe : `vendeur123`

## 🖥️ Build Desktop (Phase 2)

```bash
# Build pour Electron (à implémenter)
npm run build:desktop
```

## 📊 Scripts Disponibles

```bash
# Développement
npm run dev                  # Démarrer en mode développement
npm run build               # Build de production
npm run start               # Démarrer en production

# Base de données
npm run db:migrate          # Migrations Prisma
npm run db:seed             # Données d'exemple
npm run db:studio           # Interface Prisma Studio

# Qualité de code
npm run lint                # ESLint
npm run type-check          # Vérification TypeScript
```

## 🔒 Sécurité

### Authentification
- Mots de passe hashés avec **bcryptjs**
- JWT sécurisés avec **NextAuth.js**
- Protection des routes selon les rôles

### Conformité NF525
- Journal des ventes inaltérable
- Hash cryptographique des transactions
- Conservation des données 3 ans

## 📱 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur courant

### Produits
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `PUT /api/products/[id]` - Modifier un produit
- `DELETE /api/products/[id]` - Supprimer un produit

### Stock
- `GET /api/stock-movements` - Mouvements de stock
- `POST /api/stock-movements/entry` - Entrée de stock
- `POST /api/stock-movements/exit` - Sortie de stock

### Ventes
- `POST /api/sales` - Créer une vente
- `GET /api/sales` - Liste des ventes
- `POST /api/sales/[id]/refund` - Remboursement

## 🧪 Développement - Phases

### ✅ Phase 1 : MVP Web (En cours)
- [x] Structure du projet
- [x] Authentification NextAuth.js
- [x] Schémas de base de données
- [x] Layout et navigation
- [ ] Gestion des produits
- [ ] Interface caisse
- [ ] Mouvements de stock

### 📋 Phase 2 : Version Desktop
- [ ] Configuration Electron
- [ ] Base locale PGlite
- [ ] Synchronisation unidirectionnelle

### 📋 Phase 3 : Synchronisation Complète
- [ ] Sync bidirectionnelle
- [ ] Résolution des conflits
- [ ] Mode offline complet

### 📋 Phase 4 : Fonctionnalités Avancées
- [ ] Rapports détaillés
- [ ] Conformité NF525
- [ ] Gestion des fournisseurs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Créer une issue GitHub
- Consulter la documentation technique
- Contacter l'équipe de développement

---

**Développé avec ❤️ pour une gestion de stock moderne et efficace**