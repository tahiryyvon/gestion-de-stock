# 🏪 Système de Gestion de Stock et Point de Vente

Application complète de gestion de stock avec interface de caisse moderne, développée avec Next.js 14, TypeScript et PostgreSQL.

## 🎯 Fonctionnalités

### 👨‍💼 Admin
- 📊 Tableau de bord avec statistiques temps réel
- 📦 Gestion complète des produits et catégories
- 📈 Gestion des stocks (entrées/sorties)
- 📋 Rapports de ventes détaillés
- 👥 Gestion des utilisateurs

### 👤 Vendeur
- 🛒 Interface point de vente tactile
- 📱 Scanner de codes-barres
- 💳 Modes de paiement multiples
- 🧾 Impression de tickets
- 📊 Consultation des stocks

## 🛠️ Technologies

- **Frontend :** Next.js 14, TypeScript, Tailwind CSS
- **Backend :** Next.js API Routes
- **Base de données :** PostgreSQL + Prisma ORM  
- **Authentification :** NextAuth.js
- **UI :** Headless UI, Heroicons
- **Conformité :** NF525 (hash et chaînage des ventes)

## 🚀 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/tahiryyvon/gestion-de-stock.git
cd gestion-de-stock/app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration environnement**
```bash
cp .env.example .env.local
# Modifier .env.local avec vos paramètres de base de données
```

4. **Base de données**
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

5. **Démarrer l'application**
```bash
cd packages/web
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Accès par défaut

- **Admin :** admin@example.com / admin123

## 📱 Captures d'écran

### Tableau de bord
![Dashboard](docs/screenshots/dashboard.png)

### Point de vente
![POS](docs/screenshots/pos.png)

### Gestion des produits
![Products](docs/screenshots/products.png)

## 📁 Structure du projet

```
app/
├── packages/
│   ├── web/              # Application Next.js
│   │   ├── src/
│   │   │   ├── pages/    # Pages et API routes
│   │   │   ├── components/ # Composants React
│   │   │   └── lib/      # Utilitaires
│   │   └── package.json
│   └── shared/           # Types et utilitaires partagés
├── prisma/               # Schémas et migrations
│   ├── schema.prisma     # Modèle de données
│   └── seed.js          # Données initiales
└── README.md
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` dans `app/packages/web/` :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-jwt-très-sécurisé"

# Mode développement
NODE_ENV="development"
```

### Base de données

Le projet utilise PostgreSQL avec Prisma ORM. Pour une base de données cloud gratuite, nous recommandons [Neon](https://neon.tech/).

## 🌐 Déploiement

### Vercel (Recommandé)

1. Fork ce repository
2. Connectez votre compte Vercel à GitHub
3. Importez le projet depuis GitHub
4. Configurez les variables d'environnement
5. Déployez automatiquement !

### Variables d'environnement Vercel

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration  
npm run test:integration

# Coverage
npm run test:coverage
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour plus d'informations.

1. Forkez le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📋 Roadmap

- [x] ✅ **Phase 1** - Application web complète
- [ ] 🚧 **Phase 2** - Application desktop (Electron)
- [ ] 🔮 **Phase 3** - Application mobile
- [ ] 💡 **Phase 4** - Multi-magasins

Voir [ROADMAP.md](ROADMAP.md) pour plus de détails.

## 📄 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)

## 📞 Support

Si vous avez des questions ou des problèmes :

- 🐛 [Ouvrir une issue](https://github.com/tahiryyvon/gestion-de-stock/issues)
- 💬 [Discussions](https://github.com/tahiryyvon/gestion-de-stock/discussions)
- 📧 Email : contact@votre-email.com

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous a aidé !**