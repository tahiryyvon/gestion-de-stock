import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  if (req.method === 'POST') {
    try {
      const { productId, type, quantite, prixUnitaire, motif } = req.body

      // Validation
      if (!productId || !type || !quantite || !prixUnitaire) {
        return res.status(400).json({ error: 'Données manquantes' })
      }

      if (!['ENTRY', 'EXIT_MANUAL'].includes(type)) {
        return res.status(400).json({ error: 'Type de mouvement invalide' })
      }

      if (quantite <= 0) {
        return res.status(400).json({ error: 'La quantité doit être positive' })
      }

      // Vérifier que le produit existe
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return res.status(404).json({ error: 'Produit non trouvé' })
      }

      // Pour les sorties, vérifier le stock disponible
      if (type === 'EXIT_MANUAL') {
        const stockMovements = await prisma.stockMovement.aggregate({
          where: {
            productId,
            statut: 'VALIDATED'
          },
          _sum: {
            quantite: true
          }
        })

        const currentStock = stockMovements._sum.quantite || 0
        if (currentStock < quantite) {
          return res.status(400).json({ 
            error: `Stock insuffisant. Stock actuel: ${currentStock}` 
          })
        }
      }

      // Créer le mouvement de stock
      const finalQuantite = type === 'ENTRY' ? quantite : -quantite

      const stockMovement = await prisma.stockMovement.create({
        data: {
          productId,
          type,
          quantite: finalQuantite,
          prixUnitaire: new Decimal(prixUnitaire),
          motif: motif || undefined,
          statut: 'VALIDATED',
          createdBy: session.user.id
        },
        include: {
          product: {
            select: {
              nom: true,
              reference: true
            }
          },
          createdByUser: {
            select: {
              nom: true,
              prenom: true,
              email: true
            }
          }
        }
      })

      return res.status(201).json(stockMovement)

    } catch (error: any) {
      console.error('Erreur lors de la création du mouvement:', error)
      return res.status(500).json({ 
        error: error.message || 'Erreur lors de la création du mouvement' 
      })
    }
  }

  if (req.method === 'GET') {
    try {
      const { 
        page = '1', 
        limit = '20', 
        productId, 
        type, 
        dateFrom, 
        dateTo,
        search = ''
      } = req.query

      const pageNum = parseInt(page as string)
      const limitNum = parseInt(limit as string)
      const skip = (pageNum - 1) * limitNum

      // Construire les filtres
      const where: any = {}

      if (productId) {
        where.productId = productId
      }

      if (type && type !== 'ALL') {
        where.type = type
      }

      if (dateFrom) {
        where.createdAt = {
          ...where.createdAt,
          gte: new Date(dateFrom as string)
        }
      }

      if (dateTo) {
        const endDate = new Date(dateTo as string)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt = {
          ...where.createdAt,
          lte: endDate
        }
      }

      if (search) {
        where.OR = [
          { product: { nom: { contains: search, mode: 'insensitive' } } },
          { product: { reference: { contains: search, mode: 'insensitive' } } },
          { motif: { contains: search, mode: 'insensitive' } }
        ]
      }

      const [movements, total] = await Promise.all([
        prisma.stockMovement.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                nom: true,
                reference: true,
                imageUrl: true
              }
            },
            createdByUser: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            },
            sale: {
              select: {
                ticketNumber: true,
                numero: true
              }
            }
          }
        }),
        prisma.stockMovement.count({ where })
      ])

      return res.json({
        movements,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      })

    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}