import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { SaleData } from '@gestion-stock/shared'
import { Decimal } from '@prisma/client/runtime/library'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  if (req.method === 'POST') {
    try {
      const saleData: SaleData = req.body
      const { items, payments, remise } = saleData

      // Validation
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Aucun article dans la vente' })
      }

      if (!payments || payments.length === 0) {
        return res.status(400).json({ error: 'Aucun paiement spécifié' })
      }

      // Calculer les totaux
      let totalHT = 0
      let totalTVA = 0
      
      for (const item of items) {
        const itemTotal = item.quantity * item.prixUnitaire * (1 - (item.remise || 0) / 100)
        const itemHT = itemTotal / (1 + item.tva / 100)
        const itemTVA = itemHT * item.tva / 100
        
        totalHT += itemHT
        totalTVA += itemTVA
      }

      // Appliquer la remise globale
      if (remise && remise > 0) {
        totalHT = totalHT * (1 - remise / 100)
        totalTVA = totalTVA * (1 - remise / 100)
      }

      const totalTTC = totalHT + totalTVA
      const totalPayments = payments.reduce((sum, payment) => sum + payment.montant, 0)

      // Vérifier que le montant des paiements couvre le total
      if (totalPayments < totalTTC) {
        return res.status(400).json({ error: 'Montant des paiements insuffisant' })
      }

      // Générer le numéro de ticket
      const currentYear = new Date().getFullYear()
      const lastSale = await prisma.sale.findFirst({
        where: {
          createdAt: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1)
          }
        },
        orderBy: { numero: 'desc' }
      })

      const nextNumber = lastSale ? lastSale.numero + 1 : 1
      const ticketNumber = `${currentYear}${nextNumber.toString().padStart(6, '0')}`

      // Obtenir la vente précédente pour le hash
      const previousSale = await prisma.sale.findFirst({
        orderBy: { createdAt: 'desc' }
      })

      // Calculer le hash NF525
      const hashData = {
        numero: ticketNumber,
        date: new Date().toISOString(),
        totalTTC: totalTTC.toFixed(2),
        vendeurId: session.user.id
      }
      const hashString = JSON.stringify(hashData)
      const hash = crypto.createHash('sha256').update(hashString).digest('hex')

      // Transaction Prisma
      const sale = await prisma.$transaction(async (tx: any) => {
        // Vérifier et mettre à jour les stocks
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          })

          if (!product) {
            throw new Error(`Produit ${item.productId} non trouvé`)
          }

          if (!product.actif) {
            throw new Error(`Le produit ${product.nom} n'est pas actif`)
          }

          // Calculer le stock actuel
          const stockMovements = await tx.stockMovement.aggregate({
            where: {
              productId: item.productId,
              statut: 'VALIDATED'
            },
            _sum: {
              quantite: true
            }
          })

          const currentStock = stockMovements._sum.quantite || 0

          if (currentStock < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.nom}. Stock disponible: ${currentStock}`)
          }

          // Créer le mouvement de stock pour la sortie
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'EXIT_SALE',
              quantite: -item.quantity,
              prixUnitaire: new Decimal(item.prixUnitaire),
              motif: `Vente ticket ${ticketNumber}`,
              statut: 'VALIDATED',
              createdBy: session.user.id
            }
          })
        }

        // Créer la vente
        const newSale = await tx.sale.create({
          data: {
            numero: parseInt(ticketNumber),
            ticketNumber,
            totalHT: new Decimal(totalHT),
            totalTVA: new Decimal(totalTVA),
            totalTTC: new Decimal(totalTTC),
            remise: remise ? new Decimal(remise) : null,
            statut: 'COMPLETED',
            hash,
            previousHash: previousSale?.hash || '',
            vendeurId: session.user.id,
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantite: item.quantity,
                prixUnitaire: new Decimal(item.prixUnitaire),
                tva: new Decimal(item.tva),
                remise: item.remise ? new Decimal(item.remise) : null
              }))
            },
            payments: {
              create: payments.map(payment => ({
                mode: payment.mode,
                montant: new Decimal(payment.montant)
              }))
            }
          },
          include: {
            items: {
              include: {
                product: true
              }
            },
            payments: true,
            vendeur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        })

        return newSale
      })

      return res.status(201).json(sale)

    } catch (error: any) {
      console.error('Erreur lors de la création de la vente:', error)
      return res.status(500).json({ 
        error: error.message || 'Erreur lors de la création de la vente' 
      })
    }
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', search = '', dateFrom, dateTo } = req.query

      const pageNum = parseInt(page as string)
      const limitNum = parseInt(limit as string)
      const skip = (pageNum - 1) * limitNum

      // Construire les filtres
      const where: any = {}

      if (search) {
        where.OR = [
          { ticketNumber: { contains: search as string, mode: 'insensitive' } },
          { vendeur: { 
            OR: [
              { nom: { contains: search as string, mode: 'insensitive' } },
              { email: { contains: search as string, mode: 'insensitive' } }
            ]
          }}
        ]
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

      const [sales, total] = await Promise.all([
        prisma.sale.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    nom: true,
                    reference: true
                  }
                }
              }
            },
            payments: true,
            vendeur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }),
        prisma.sale.count({ where })
      ])

      return res.json({
        sales,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      })

    } catch (error) {
      console.error('Erreur lors de la récupération des ventes:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}