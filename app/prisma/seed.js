const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Création des données initiales...')

  // Créer un utilisateur administrateur par défaut
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrateur Système',
      password: hashedPassword,
      role: 'ADMIN',
      actif: true
    },
  })

  console.log('👤 Utilisateur administrateur créé:', admin.email)

  // Créer quelques catégories par défaut
  const categories = [
    { name: 'Électronique', description: 'Produits électroniques' },
    { name: 'Vêtements', description: 'Articles vestimentaires' },
    { name: 'Alimentaire', description: 'Produits alimentaires' },
    { name: 'Maison', description: 'Articles pour la maison' },
  ]

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
    console.log('📂 Catégorie créée:', category.name)
  }

  // Créer quelques produits d'exemple
  const electronicsCategory = await prisma.category.findFirst({
    where: { name: 'Électronique' }
  })

  const clothingCategory = await prisma.category.findFirst({
    where: { name: 'Vêtements' }
  })

  if (electronicsCategory && clothingCategory) {
    const products = [
      {
        nom: 'iPhone 15',
        description: 'Smartphone Apple dernière génération',
        reference: 'IPHONE15-128',
        codeBarre: '1234567890123',
        prixAchat: 699.99,
        prixVente: 899.99,
        tva: 20.0,
        seuilAlerte: 5,
        categorieId: electronicsCategory.id,
        actif: true
      },
      {
        nom: 'T-Shirt Unisexe',
        description: 'T-shirt en coton biologique',
        reference: 'TSHIRT-UNI-M',
        codeBarre: '2345678901234',
        prixAchat: 8.50,
        prixVente: 19.99,
        tva: 20.0,
        seuilAlerte: 20,
        categorieId: clothingCategory.id,
        actif: true
      }
    ]

    for (const prod of products) {
      const product = await prisma.product.upsert({
        where: { reference: prod.reference },
        update: {},
        create: {
          ...prod,
          prixAchat: prod.prixAchat,
          prixVente: prod.prixVente,
          tva: prod.tva
        },
      })
      console.log('📦 Produit créé:', product.nom)

      // Ajouter un stock initial
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'ENTRY',
          quantity: 50,
          motif: 'Stock initial',
          userId: admin.id
        }
      })
      console.log('📈 Stock initial ajouté pour:', product.nom)
    }
  }

  console.log('✅ Données initiales créées avec succès!')
  console.log('')
  console.log('🔑 Connexion administrateur:')
  console.log('   Email: admin@example.com')
  console.log('   Mot de passe: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })