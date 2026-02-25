# 🚀 Guide de Déploiement Vercel

## ⚠️ Configuration Vercel Requise

### 1. 🔧 Variables d'environnement à configurer dans Vercel

Allez dans votre **Dashboard Vercel** → **Project Settings** → **Environment Variables** et ajoutez :

```bash
# Base de données (OBLIGATOIRE)
DATABASE_URL=postgresql://neondb_owner:npg_7oqKaeiwz9rC@ep-lively-firefly-aiso9ofl-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth.js (OBLIGATOIRE)
NEXTAUTH_URL=https://VOTRE-DOMAINE-VERCEL.vercel.app
NEXTAUTH_SECRET=ic8hlSvMZUtxrNFmxHtHe2zRCLKUQ7OvtsfPOTPT9nA=

# Configuration
NODE_ENV=production
APP_MODE=web
```

### 2. 📁 Configuration Build dans Vercel

Dans le Dashboard Vercel, configurez :

1. **Root Directory** : `./` (racine du projet)
2. **Build Command** : `npm run build`
3. **Output Directory** : `app/packages/web/.next`
4. **Install Command** : `npm run install-all`
5. **Node.js Version** : `18.x`

### 3. 🗄️ Base de données

Votre base de données Neon est déjà configurée et contient :
- ✅ Schéma Prisma déployé
- ✅ Données d'exemple (admin@example.com / admin123)
- ✅ Tables : User, Product, Category, Sale, StockMovement, etc.

## 🔄 Processus de déploiement automatique

1. **Push sur GitHub** → Vercel détecte automatiquement
2. **Build automatique** avec `npm run build` dans le dossier `app/`
3. **Prisma generate** exécuté automatiquement via `postinstall`
4. **Déploiement** sur votre domaine Vercel

## ✅ Vérifications post-déploiement

Une fois déployé, testez :

1. **Page d'accueil** : `https://votre-app.vercel.app`
2. **Login admin** : `admin@example.com` / `admin123`
3. **API santé** : `https://votre-app.vercel.app/api/products`
4. **Dashboard** : Vérifiez les statistiques
5. **POS** : Testez une vente

## 🐛 Problèmes courants

### Build Error: "Cannot find module '@prisma/client'"
**Solution :** Vérifiez que `postinstall: "npx prisma generate"` est dans package.json

### API Error: "PrismaClient is unable to connect"
**Solution :** Vérifiez que `DATABASE_URL` est configurée dans Vercel

### Auth Error: "Missing NEXTAUTH_SECRET"
**Solution :** Configurez `NEXTAUTH_SECRET` et `NEXTAUTH_URL` dans Vercel

### 404 on API routes
**Solution :** Vérifiez que `outputDirectory` pointe vers `packages/web/.next`

## 🔗 Liens utiles

- **Vercel Dashboard** : https://vercel.com/dashboard
- **GitHub Repository** : https://github.com/tahiryyvon/gestion-de-stock
- **Neon Database** : https://console.neon.tech

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de build dans Vercel
2. Consultez la [documentation Vercel](https://vercel.com/docs)
3. Ouvrez une issue sur GitHub