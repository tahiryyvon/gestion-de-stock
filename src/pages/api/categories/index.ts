import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

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
    const categories = await prisma.category.findMany({
      where: { actif: true },
      include: {
        _count: {
          select: { products: true }
        },
        parent: true,
        children: true
      },
      orderBy: { name: 'asc' }
    })

    res.json({ categories })
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, session: any) {
  // Seuls les admins peuvent créer des catégories
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Permission refusée' })
  }

  try {
    const { name, description, parentId } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' })
    }

    // Vérifier l'unicité du nom
    const existing = await prisma.category.findUnique({
      where: { name }
    })

    if (existing) {
      return res.status(400).json({ error: 'Une catégorie avec ce nom existe déjà' })
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true
      }
    })

    res.status(201).json(category)
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}