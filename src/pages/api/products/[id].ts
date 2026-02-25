import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const { id } = req.query

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id as string)
    case 'PUT':
      return handlePut(req, res, id as string, session)
    case 'DELETE':
      return handleDelete(req, res, id as string, session)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: 'Méthode non autorisée' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categorie: true,
        stockMovements: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' })
    }

    // Calculer le stock actuel
    const stockActuel = product.stockMovements.reduce((stock: number, movement: any) => {
      if (movement.type === 'ENTRY') {
        return stock + movement.quantity
      } else {
        return stock - movement.quantity
      }
    }, 0)

    res.json({
      ...product,
      stockActuel
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string, session: any) {
  // Seuls les admins peuvent modifier des produits
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Permission refusée' })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: req.body,
      include: {
        categorie: true
      }
    })

    res.json(updatedProduct)
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string, session: any) {
  // Seuls les admins peuvent supprimer des produits
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Permission refusée' })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' })
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { actif: false }
    })

    res.json({ message: 'Produit supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}