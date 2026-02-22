import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'
import { ProductSchema } from '@gestion-stock/shared'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'POST':
      return handlePost(req, res, session)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: 'Méthode non autorisée' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search = '', 
      categoryId = '',
      actif = 'true' 
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {
      actif: actif === 'true',
      ...(search && {
        OR: [
          { nom: { contains: search as string, mode: 'insensitive' } },
          { reference: { contains: search as string, mode: 'insensitive' } },
          { codeBarre: { contains: search as string, mode: 'insensitive' } },
        ]
      }),
      ...(categoryId && { categorieId: categoryId as string })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categorie: true,
          stockMovements: {
            select: {
              type: true,
              quantity: true,
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    // Calculer le stock actuel pour chaque produit
    const productsWithStock = products.map(product => {
      const stockActuel = product.stockMovements.reduce((stock, movement) => {
        if (movement.type === 'ENTRY') {
          return stock + movement.quantity
        } else {
          return stock - movement.quantity
        }
      }, 0)

      return {
        ...product,
        stockActuel,
        stockMovements: undefined // Ne pas renvoyer tous les mouvements
      }
    })

    res.json({
      products: productsWithStock,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, session: any) {
  // Seuls les admins peuvent créer des produits
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Permission refusée' })
  }

  try {
    const validatedData = ProductSchema.parse(req.body)

    // Vérifier l'unicité de la référence et du code-barres
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { reference: validatedData.reference },
          ...(validatedData.codeBarre ? [{ codeBarre: validatedData.codeBarre }] : [])
        ]
      }
    })

    if (existing) {
      return res.status(400).json({ 
        error: 'Un produit avec cette référence ou ce code-barres existe déjà' 
      })
    }

    const product = await prisma.product.create({
      data: validatedData,
      include: {
        categorie: true
      }
    })

    // Si un stock initial est fourni dans les variations, créer un mouvement
    if (req.body.stockInitial && req.body.stockInitial > 0) {
      await prisma.stockMovement.create({
        data: {
          type: 'ENTRY',
          quantity: req.body.stockInitial,
          productId: product.id,
          userId: session.user.id,
          motif: 'Stock initial'
        }
      })
    }

    res.status(201).json(product)
  } catch (error: any) {
    console.error('Erreur lors de la création du produit:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: error.errors 
      })
    }

    res.status(500).json({ error: 'Erreur serveur' })
  }
}