import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation des données...')

  // Créer l'utilisateur administrateur par défaut
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  })

  console.log('✅ Utilisateur admin créé:', adminUser.email)

  // Créer un utilisateur vendeur
  const vendeurPassword = await bcrypt.hash('vendeur123', 12)
  
  const vendeurUser = await prisma.user.upsert({
    where: { email: 'vendeur@example.com' },
    update: {},
    create: {
      email: 'vendeur@example.com',
      password: vendeurPassword,
      name: 'Vendeur',
      role: 'VENDEUR',
    },
  })

  console.log('✅ Utilisateur vendeur créé:', vendeurUser.email)

  // Créer des catégories d'exemple
  const categories = [
    {
      name: 'Électronique',
      description: 'Appareils et composants électroniques',
    },
    {
      name: 'Vêtements',
      description: 'Articles vestimentaires et accessoires',
    },
    {
      name: 'Alimentation',
      description: 'Produits alimentaires et boissons',
    },
    {
      name: 'Bureautique',
      description: 'Fournitures et équipements de bureau',
    },
  ]

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    })
    console.log('✅ Catégorie créée:', category.name)
  }

  // Récupérer les catégories pour les produits
  const electroniqueCategory = await prisma.category.findUnique({
    where: { name: 'Électronique' }
  })
  
  const vetementsCategory = await prisma.category.findUnique({
    where: { name: 'Vêtements' }
  })

  if (electroniqueCategory && vetementsCategory) {
    // Créer des produits d'exemple
    const products = [
      {
        codeBarre: '1234567890123',
        reference: 'SP-001',
        nom: 'Smartphone Galaxy',
        description: 'Smartphone Android dernière génération',
        categorieId: electroniqueCategory.id,
        prixAchat: 299.99,
        prixVente: 449.99,
        tva: 20.0,
        seuilAlerte: 5,
      },
      {
        codeBarre: '2234567890123',
        reference: 'LP-001',
        nom: 'Ordinateur Portable',
        description: 'PC portable 15 pouces, 8GB RAM, SSD 256GB',
        categorieId: electroniqueCategory.id,
        prixAchat: 599.99,
        prixVente: 899.99,
        tva: 20.0,
        seuilAlerte: 3,
      },
      {
        codeBarre: '3234567890123',
        reference: 'TS-001',
        nom: 'T-Shirt Cotton',
        description: 'T-shirt 100% coton, disponible en plusieurs tailles',
        categorieId: vetementsCategory.id,
        prixAchat: 8.99,
        prixVente: 19.99,
        tva: 20.0,
        seuilAlerte: 20,
      },
    ]

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: { reference: productData.reference },
        update: {},
        create: productData,
      })
      
      // Ajouter du stock initial
      await prisma.stockMovement.create({
        data: {
          type: 'ENTRY',
          quantity: 50,
          productId: product.id,
          userId: adminUser.id,
          motif: 'Stock initial',
        },
      })
      
      console.log('✅ Produit créé avec stock:', product.nom)
    }
  }

  // Créer quelques fournisseurs
  const fournisseurs = [
    {
      nom: 'TechDistrib',
      contact: 'Jean Dupont',
      telephone: '01 23 45 67 89',
      email: 'contact@techdistrib.com',
      adresse: '123 Rue de la Tech, 75001 Paris',
    },
    {
      nom: 'Mode & Style',
      contact: 'Marie Martin',
      telephone: '01 98 76 54 32',
      email: 'commande@modestyle.fr',
      adresse: '456 Avenue de la Mode, 69000 Lyon',
    },
  ]

  for (const fournisseurData of fournisseurs) {
    const existing = await prisma.fournisseur.findFirst({
      where: { nom: fournisseurData.nom }
    })
    
    if (!existing) {
      const fournisseur = await prisma.fournisseur.create({
        data: fournisseurData,
      })
      console.log('✅ Fournisseur créé:', fournisseur.nom)
    } else {
      console.log('ℹ️  Fournisseur existe déjà:', existing.nom)
    }
  }

  console.log('🎉 Initialisation terminée!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })