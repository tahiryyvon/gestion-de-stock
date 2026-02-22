# Guide de Contribution

Merci de votre intérêt pour contribuer à ce projet ! Voici comment vous pouvez aider à améliorer cette application de gestion de stock.

## 🚀 Démarrage rapide

### 1. Fork et Clone
```bash
# Forkez le repository sur GitHub puis clonez votre fork
git clone https://github.com/VOTRE_USERNAME/gestion-de-stock.git
cd gestion-de-stock/app

# Ajoutez le repository original comme remote upstream
git remote add upstream https://github.com/tahiryyvon/gestion-de-stock.git
```

### 2. Installation
```bash
# Installez les dépendances
npm install

# Configurez l'environnement
cp .env.example .env.local
# Éditez .env.local avec vos paramètres

# Configurez la base de données
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 3. Développement
```bash
# Démarrez le serveur de développement
cd packages/web
npm run dev
```

## 🏗️ Structure du code

```
app/
├── packages/
│   ├── web/                    # Application Next.js principale
│   │   ├── src/
│   │   │   ├── pages/          # Pages Next.js et API Routes
│   │   │   │   ├── api/        # Endpoints API
│   │   │   │   ├── auth/       # Pages d'authentification
│   │   │   │   ├── products/   # Gestion des produits
│   │   │   │   ├── sales/      # Gestion des ventes
│   │   │   │   └── stock/      # Gestion des stocks
│   │   │   ├── components/     # Composants React réutilisables
│   │   │   │   ├── layouts/    # Layouts de page
│   │   │   │   └── ui/         # Composants d'interface
│   │   │   └── lib/            # Utilitaires et configurations
│   │   └── package.json
│   └── shared/                 # Types et utilitaires partagés
│       └── src/
│           ├── types.ts        # Définitions TypeScript
│           ├── utils.ts        # Fonctions utilitaires
│           └── schemas.ts      # Schémas de validation
└── prisma/                     # Configuration base de données
    ├── schema.prisma          # Modèle de données
    └── seed.js               # Données d'exemple
```

## 📋 Standards de code

### TypeScript
- Utilisez TypeScript pour tous les nouveaux fichiers
- Définissez des types stricts, évitez `any`
- Utilisez les interfaces du package `shared` pour la cohérence

### Composants React
```typescript
// ✅ Bon exemple
interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  // Logique du composant
}
```

### API Routes
```typescript
// ✅ Structure recommandée pour les API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  if (req.method === 'GET') {
    // Logique GET
  } else if (req.method === 'POST') {
    // Logique POST
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### Styles
- Utilisez Tailwind CSS pour le styling
- Préférez les classes utilitaires aux styles custom
- Utilisez les classes responsives (`sm:`, `md:`, `lg:`)

### Base de données
- Toutes les modifications du schéma doivent passer par Prisma
- Testez les migrations sur une base de données de développement
- Ajoutez des seeds pour les nouvelles entités si nécessaire

## 🧪 Tests

### Tests unitaires
```bash
# Lancez les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Tests d'intégration
```bash
# Tests d'intégration API
npm run test:integration
```

### Conventions de test
- Nommez les fichiers de test `*.test.ts` ou `*.spec.ts`
- Placez les tests à côté des fichiers qu'ils testent
- Utilisez des descriptions claires pour les tests

```typescript
describe('ProductAPI', () => {
  it('should create a new product', async () => {
    // Test logic
  });

  it('should return 401 for unauthenticated requests', async () => {
    // Test logic  
  });
});
```

## 🔄 Workflow de contribution

### 1. Créer une branche
```bash
# Synchronisez avec upstream
git checkout main
git pull upstream main

# Créez une nouvelle branche
git checkout -b feature/nom-de-votre-feature
# ou
git checkout -b fix/description-du-bug
```

### 2. Développement
- Faites des commits atomiques et descriptifs
- Suivez la convention de nommage des commits :
  - `feat:` pour une nouvelle fonctionnalité
  - `fix:` pour une correction de bug
  - `docs:` pour la documentation
  - `style:` pour les changements de style
  - `refactor:` pour la refactorisation
  - `test:` pour les tests

```bash
# Exemples de bons commits
git commit -m "feat: add product barcode scanner"
git commit -m "fix: resolve stock calculation error"
git commit -m "docs: update installation instructions"
```

### 3. Tests et validation
```bash
# Vérifiez que tout fonctionne
npm run build
npm test
npm run lint
```

### 4. Push et Pull Request
```bash
# Pushez votre branche
git push origin feature/nom-de-votre-feature
```

Ouvrez ensuite une Pull Request sur GitHub avec :
- Un titre clair et descriptif
- Une description détaillée des changements
- Des captures d'écran si pertinent
- La mention des issues liées (`Closes #123`)

## 🐛 Signaler des bugs

Utilisez les GitHub Issues avec les informations suivantes :

### Template de bug report
```markdown
## 🐛 Description du bug
Description claire et concise du problème.

## 🔄 Étapes pour reproduire
1. Allez à '...'
2. Cliquez sur '...'
3. Faites défiler jusqu'à '...'
4. Voyez l'erreur

## ✅ Comportement attendu
Description claire de ce qui devrait se passer.

## 📱 Environnement
- OS: [e.g. Windows 11, macOS 12]
- Navigateur: [e.g. Chrome 91, Safari 14]
- Version Node.js: [e.g. 18.17.0]
- Version de l'app: [e.g. 1.2.3]

## 📷 Captures d'écran
Si applicable, ajoutez des captures d'écran.

## 📝 Informations additionnelles
Tout autre contexte utile.
```

## 💡 Suggérer des fonctionnalités

### Template de feature request
```markdown
## 🚀 Résumé de la fonctionnalité
Description concise de la fonctionnalité souhaitée.

## 🎯 Problème à résoudre
Quel problème cette fonctionnalité résoudrait-elle ?

## 💡 Solution proposée
Description détaillée de votre solution.

## 🔄 Alternatives considérées
Autres solutions que vous avez envisagées.

## 📋 Critères d'acceptation
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3
```

## 🎨 Guidelines de design

- Suivez les principes de Material Design / Tailwind UI
- Assurez-vous de l'accessibilité (contrastes, navigation clavier)
- Testez sur mobile et desktop
- Utilisez les couleurs et espacements définis dans le thème

## 📚 Documentation

- Documentez les nouvelles fonctionnalités dans le README
- Ajoutez des commentaires JSDoc pour les fonctions complexes
- Mettez à jour la roadmap si nécessaire

## 🤝 Code de conduite

- Soyez respectueux et bienveillant
- Accueillez les nouveaux contributeurs
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres membres

## 🙏 Reconnaissance

Tous les contributeurs seront ajoutés au fichier `CONTRIBUTORS.md` et mentionnés dans les releases notes.

## ❓ Questions

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une [Discussion GitHub](https://github.com/tahiryyvon/gestion-de-stock/discussions)
- Créer une issue avec le label `question`

Merci pour votre contribution ! 🎉